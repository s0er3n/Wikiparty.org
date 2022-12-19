import { Component, For } from "solid-js"
import { sendMessage } from "./App"

type Props = {
  players: any[]
}
const PlayerList: Component<Props> = (props) => {
  return (
    <div class='h-full'>
      <div >
        <ul>
          <For each={props.players ?? []}>
            {(player, i) => <li><div class="flex flex-row">
              <div>{player[0].name}</div>
              <div>{player[0].points}</div>
              <div>{player[1].moves.join(" -> ")}
              </div></div></li>}
          </For>
        </ul>
      </div>

      <button class="btn" onclick={() => {
        sendMessage(
          { type: "game", "method": "go_to_lobby", args: {} }
        )
      }}>go to lobby</button>
    </div>
  )
}

export default PlayerList
