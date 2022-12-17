import { For, Component, createEffect, Show } from 'solid-js';
import { createSignal } from "solid-js"
import { v4 as uuidv4 } from 'uuid';
import Header from "./Header"
import JoinOrCreateLobby from './JoinOrCreateLobby';
import SetArticle from './SetArticle';
import SetTime from './SetTime';
import SetUserName from './SetUserName';


let oldMoves: string[] = []
let [connected, setConnection] = createSignal<boolean>(false)
let [hasUserName, setHasUserName] = createSignal<boolean>(false)
let ws;

export function sendMessage(msg: any) {

  ws.send(JSON.stringify(msg))

}



let setRoleMsg = {
  "type": "game", "method": "set_role", "args": {
    "player_id": "ADD ID HERE",
    "role": "hunting"
  }
}



let setArticleMsg = {
  "type": "game", "method": "set_article", "args": {
    "article": "test",
    "start": false,
  }
}




let startGameMsg = { "type": "game", "method": "start", "args": {} }

let moveMsg = {
  "type": "game", "method": "move",
  "args": { "target": "Exam" }
}
// let [players, setPlayers = createSignal([])


let [wiki, setWiki] = createSignal()
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

history.pushState(null, null, location.href);
window.onpopstate = function(e: any) {
  e.preventDefault()

  if (oldMoves) {
    let undoMoveMsg = moveMsg
    undoMoveMsg.args.target = oldMoves.pop()
    sendMessage(undoMoveMsg)
    console.log(e)
  }
};
const App: Component = () => {

  return (

    <div >
      <Header lobby={lobby()} />

      <div class=''>

        <Show
          when={connected()}
          fallback={<button class='w-96' onclick={() => { startWS() }}>start ws connection</button>}
        >
          <Show when={!hasUserName() && !lobby()}><SetUserName setHasUserName={setHasUserName} /></Show>
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

const SearchResults: Component = () => {
  return (<div>

  </div>)

}

const Lobby: Component = () => {


  return (
    <>
      <Show when={lobby().state === "idle" && !lobby().start_article || !lobby().articles_to_find.length} >
        <SetArticle lobby={lobby()} search={search()} />
      </Show>
      <Show when={lobby().state === "idle" && lobby().start_article && lobby().articles_to_find.length} >
        <PlayerList />
        <SetTime time={lobby().time} />
        <button class='btn' onclick={
          () => {
            sendMessage(startGameMsg)
          }
        }>start game</button>
      </Show>
      <Show when={lobby().state === "ingame"}>
        <> <Wiki /> </>
      </Show ></>)
}

const Wiki: Component = () => {
  return (
    <div class='mt-24 text-6xl font-bold'>{wiki()?.title ?? ""}
      <article class='prose ' onclick={(e) => {
        let targetValue = e.target.getAttribute("href")
        if (targetValue?.includes("wiki")) {
          e.preventDefault()
          let move = moveMsg
          move.args.target = targetValue.split("/").pop()
          sendMessage(move)
          oldMoves.push(move.args.target)
        }
      }
      } innerHTML={wiki()?.text?.["*"].replace("[edit]", "") ?? ""} />
    </div>
  )
}


const LobbyCode: Component = () => {
  // TODO: add on click copy to clipboard
  return (<div>
    <span class='font-bold'>lobby code:</span><input class='input' value={lobby().id}></input>
    <span>{lobby().start_article}</span>
    <span>{lobby().articles_to_find}</span>
  </div>)
}

const PlayerList: Component = () => {
  return (
    <div class='h-full'>
      <ul>
        <For each={lobby()?.players ?? []}>{(player: any, i: number) => <li>{player[0].name}{JSON.stringify(player[1].moves)}{player[1].state}
          <button class='btn' onclick={() => {
            let msg = setRoleMsg
            msg.args.role = "hunting"
            msg.args.player_id = player[0].id
            sendMessage(msg)
          }}>set role hunting</button>
        </li>}
        </For>
      </ul>
    </div>
  )
}

const InGameHeader: Component = () => {
  return (
    <div class='fixed top-0 bg-white'>
      <For each={lobby()?.players.filter(p => p[0].id != id) ?? []}>
        {(player: any, i: number) => <span class='text-xl font-bold'>
          Player: {player[0].id} Position:{player[1].moves.at(-1)}
        </span>}
      </For>
    </div>
  )
}

export default App;
