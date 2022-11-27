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

}

let [lobby, setLobby] = createSignal<any>(undefined)


const App: Component = () => {
  return (
    <div >
      <Show
        when={connected()}
        fallback={<button onclick={() => { startWS() }}>start ws connection</button>}
      >
        <Show when={lobby()} fallback={<JoinOrCreateLobby />}>
          lobby id: {lobby().id}
          <Show when={lobby().state === "idle"} >
            <ul>
              <For each={lobby()?.players ?? []}>{(player: any, i: number) => <li>{player[0].name}{JSON.stringify(player[1].moves)}{player[1].state}
                <button onclick={() => {
                  let msg = setRoleMsg
                  msg.args.role = "fleeing"
                  msg.args.player_id = player[0].id
                  sendMessage(msg)
                }}>set role fleeing</button>
                <button onclick={() => {
                  let msg = setRoleMsg
                  msg.args.role = "hunting"
                  msg.args.player_id = player[0].id
                  sendMessage(msg)
                }}>set role hunting</button>
              </li>}
              </For>
            </ul>

            <button onclick={() => {
              sendMessage(startGameMsg)
            }}>start game</button>
          </Show>
          <Show when={lobby().state === "fleeing" || lobby().state === "finding"} >
              <For each={lobby()?.players ?? []}>
              {(player: any, i: number) => <li>{player[0].id}{player[1].moves.at(-1)}{player[1].state}
              </li>}
              </For>
          </Show>
          <Show when={lobby().state === "fleeing"} >
            fleeing
            <Show when={lobby().players.find((p: any) => {
              return p[0].id == id && p[1].state == "fleeing"
            })} fallback={<div>the hunted person has 15 seconds to flee</div>}>
              <button onclick={() => {
                sendMessage(moveMsg)
              }}>move</button>
              <> <Wiki /> </>
            </Show>

          </Show>
          <Show when={lobby().state === "finding"}>
            <button onclick={() => {
              sendMessage(moveMsg)
            }}>move</button>
            <> <Wiki /> </>
          </Show >
        </Show>
      </Show>
    </div>
  );
};

const Wiki: Component = () => {
  return (
    <div onclick={(e) => {
      let targetValue = e.target.getAttribute("href")
      if (targetValue?.includes("wiki")) {
        e.preventDefault()
        let move = moveMsg
        move.args.target = targetValue.split("/").pop()
        sendMessage(move)
      }}
    } innerHTML={wiki()} />
  )
}

const JoinOrCreateLobby: Component = () => {
  return (<div>
    <button onclick={() => {
      sendMessage(startLobbyMsg)
    }}>create lobby</button>

    id: <input onchange={(e: any) => { setIdToJoin(e.target.value) }} />
    <button onclick={() => {
      sendMessage(joinLobbyMsg)
    }}>join</button>
  </div>)
}


export default App;
