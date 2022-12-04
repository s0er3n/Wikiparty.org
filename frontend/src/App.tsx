import { For, Component, createEffect, Show } from 'solid-js';
import { createSignal } from "solid-js"


let [connected, setConnection] = createSignal<boolean>(false)
let [idToJoin, setIdToJoin] = createSignal<string>("")
let ws;

function sendMessage(msg: any) {

  ws.send(JSON.stringify(msg))

}


let startLobbyMsg = { "type": "lobby", "method": "new_lobby", "args": {} }

let joinLobbyMsg = {
  "type": "lobby",
  "method": "join_lobby",
  "args": { "id": idToJoin() },
}

let setRoleMsg = {
  "type": "game", "method": "set_role", "args": {
    "player_id": "ADD ID HERE",
    "role": "hunting"
  }
}


let startGameMsg = { "type": "game", "method": "start", "args": {} }

let moveMsg = {
  "type": "game", "method": "move",
  "args": { "target": "Exam" }
}
// let [players, setPlayers = createSignal([])

createEffect(() => {
  joinLobbyMsg = {
    "type": "lobby",
    "method": "join_lobby",
    "args": { "id": idToJoin() },
  }
})

let [wiki, setWiki] = createSignal()

let id = Math.floor(Math.random() * 100)
function startWS() {
  ws = new WebSocket(`ws://localhost:8000/ws/${id}`)

  ws.onopen = (_) => {
    setConnection(true)
  }
  ws.onmessage = (e) => {
    let data = JSON.parse(e.data)

    if (data.id) {
      console.log(data)
      setLobby(data)
    } else if (data.data) {
      setWiki(data.data)
      console.log(data)
    }
    else {
      console.log(e)
    }
  }

  ws.onclose = () => {
    setConnection(false)
    ws = new WebSocket(`ws://localhost:8000/ws/${id}`)
  }

}

let [lobby, setLobby] = createSignal<any>(undefined)

startWS()

const App: Component = () => {
  return (
    <div class='w-full h-full  flex items-center justify-center '>
      <div class=''>
        <Show
          when={connected()}
          fallback={<button class='w-96' onclick={() => { startWS() }}>start ws connection</button>}
        >
          <Show when={lobby()} fallback={<JoinOrCreateLobby />}>
          <Lobby />
          </Show>
        </Show>
      </div>
    </div>

  );
};

const Lobby: Component = () => {


  return (
    <>
      <Show when={lobby().state === "idle" || lobby().state === "over"} >
        <LobbyCode />
        <PlayerList />
        <button class='btn' onclick={() => {
          sendMessage(startGameMsg)
        }}>start game</button>
      </Show>
      <Show when={lobby().state === "fleeing" || lobby().state === "finding"} >
        <InGameHeader/>
      </Show>
      <Show when={lobby().state === "fleeing"} >
        <Show when={lobby().players.find((p: any) => {
          return p[0].id == id && p[1].state == "fleeing"
        })} fallback={<div>the hunted person has 15 seconds to flee</div>}>
          <> <Wiki /> </>
        </Show>
      </Show>
      <Show when={lobby().state === "finding"}>
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
        }
      }
      } innerHTML={wiki()?.text?.["*"].replace("[edit]", "") ?? ""} />
    </div>
  )
}

const JoinOrCreateLobby: Component = () => {
  return (<div>
    <button class='btn' onclick={() => {
      sendMessage(startLobbyMsg)
    }}>create lobby</button>

    id: <input onchange={(e: any) => { setIdToJoin(e.target.value) }} />
    <button class='btn' onclick={() => {
      sendMessage(joinLobbyMsg)
    }}>join</button>
  </div>)
}

const LobbyCode: Component = () => {
  // TODO: add on click copy to clipboard
  return (<div>

    <span class='font-bold'>lobby code:</span><input class='input' value={lobby().id}></input>
  </div>)
}

const PlayerList: Component = () => {
  return (
    <div class='h-full'>
      <ul>
        <For each={lobby()?.players ?? []}>{(player: any, i: number) => <li>{player[0].name}{JSON.stringify(player[1].moves)}{player[1].state}
          <button class='btn ' onclick={() => {
            let msg = setRoleMsg
            msg.args.role = "fleeing"
            msg.args.player_id = player[0].id
            sendMessage(msg)

          }}>set role fleeing</button>
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
