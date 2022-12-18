import { For, Component, createEffect, Show } from 'solid-js';
import { createSignal } from "solid-js"
import { v4 as uuidv4 } from 'uuid';
import GameOver from './GameOver';
import Header from "./Header"
import JoinOrCreateLobby from './JoinOrCreateLobby';
import SetArticle from './SetArticle';
import SetTime from './SetTime';
import SetUserName from './SetUserName';


let [connected, setConnection] = createSignal<boolean>(false)
let [hasUserName, setHasUserName] = createSignal<boolean>(false)
let ws: WebSocket | null = null;

export function sendMessage(msg: any) {
  if (ws) {
    ws.send(JSON.stringify(msg))
  }
  else {
    console.warn("websocket not connected")
  }

}



let setRoleMsg = {
  "type": "game", "method": "set_role", "args": {
    "player_id": "ADD ID HERE",
    "role": "hunting"
  }
}






let startGameMsg = { "type": "game", "method": "start", "args": {} }

// let [players, setPlayers = createSignal([])


let [wiki, setWiki] = createSignal<{ title: string, text: { "*": string } }>()
let id = localStorage.getItem("id")

let setUserNameMsg = {
  "type": "player",
  "method": "set_user_name",
  "args": { "name": "Gast" },
}

if (!id) {
  id = uuidv4() as string
  localStorage.setItem("id", id)
}

const [search, setSearch] = createSignal([])

function startWS() {
  ws = new WebSocket(`ws://localhost:8000/ws/${id}`)

  ws.onopen = (_) => {
    setConnection(true)
    let username = localStorage.getItem("username")
    if (username) {
      let msg = setUserNameMsg
      setUserNameMsg.args.name = username
      sendMessage(msg)
      setHasUserName(true)
    }
  }
  ws.onmessage = (e) => {
    let data = JSON.parse(e.data)

    if (data.id) {
      console.log(data)
      if (data?.state == "over") {
        setGoToLobby(false)
      }
      setLobby(data)
    } else if (data.data.text) {
      setWiki(data.data)
      console.log(data)
    } else if (typeof data.data === "object") {
      console.log(data.data)
      setSearch(data.data)
    }
    else {
      console.log(e)
    }
  }


}

let [lobby, setLobby] = createSignal<any>(undefined)

startWS()

const App: Component = () => {

  return (

    <div >
      <Header lobby={lobby} />

      <div class=''>

        <Show
          when={connected()}
          fallback={<button class='w-96' onclick={() => { startWS() }}>start ws connection</button>}
        >
          <Show when={!hasUserName() && !lobby()}>
            <SetUserName setHasUserName={setHasUserName} />
          </Show>
          <Show when={lobby()}>
            <Lobby />
          </Show>
          <Show when={!lobby() && hasUserName()}>
            <JoinOrCreateLobby />
          </Show>
        </Show>
      </div>
    </div>

  );
};


const [goToLobby, setGoToLobby] = createSignal(false)
const Lobby: Component = () => {


  return (
    <>
      <Show when={lobby().state === "idle" && !lobby().start_article} >
        <SetArticle lobby={lobby} search={search} />
      </Show>
      <Show when={lobby().state === "idle" && lobby().start_article && !goToLobby()} >
        <SetArticle lobby={lobby} search={search} />

        <Show when={lobby().state === "idle" && lobby().articles_to_find.length} >
          <button class='btn' onclick={() => {
            setGoToLobby(true)
          }}>go to lobby</button>
        </Show>
      </Show>
      <Show when={lobby().state === "idle" && lobby().start_article && goToLobby()} >
        <PlayerList />
        <SetTime time={lobby().time} />
        <button class='btn' onclick={
          () => {
            sendMessage(startGameMsg)
          }
        }>start game</button>
      </Show>
      <Show when={lobby().state === "ingame"}>
        <>{lobby().articles_to_find.join(" | ")}</>
        <> <Wiki /> </>
      </Show >

      <Show when={lobby().state === "over"}>
        <GameOver players={lobby().players} />
      </Show >
    </>)
}

const Wiki: Component = () => {
  return (
    <div class='mt-24 text-6xl font-bold'>{wiki()?.title ?? ""}
      <article class='prose ' onclick={(e) => {
        let targetValue = e.target.getAttribute("href")
        if (targetValue?.includes("wiki")) {
          let moveMsg = {
            "type": "game", "method": "move",
            "args": { "target": targetValue.split("/").pop() }
          }
          e.preventDefault()
          sendMessage(moveMsg)
        }
      }
      } innerHTML={wiki()?.text?.["*"].replace("[edit]", "") ?? ""} />
    </div>
  )
}


const PlayerList: Component = () => {
  return (
    <div class='h-full'>
      <ul>
        <For each={lobby()?.players ?? []}>{(player: any, i) => <li>{player[0].name}{JSON.stringify(player[1].moves)}{player[1].state}
        </li>}
        </For>
      </ul>
    </div>
  )
}

export default App;
