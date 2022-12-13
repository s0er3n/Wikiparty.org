import { Component, createEffect, createSignal } from "solid-js"

import { sendMessage } from "./App"
let [idToJoin, setIdToJoin] = createSignal<string>("")

let joinLobbyMsg = {
  "type": "lobby",
  "method": "join_lobby",
  "args": { "id": idToJoin() },
}

createEffect(() => {
  joinLobbyMsg = {
    "type": "lobby",
    "method": "join_lobby",
    "args": { "id": idToJoin() },
  }
})

let newLobbyMsg = { "type": "lobby", "method": "new_lobby", "args": {} }

const JoinOrCreateLobby: Component = () => {
  return (<div class="w-full flex flex-row items-center justify-center justify-items-center">
    <div class="w-full flex flex-row items-center justify-center justify-items-center">
      <div class="input-group w-fit">
        <input type="text" placeholder="type in the code…" class="input input-bordered" />
        <button class="btn " onclick={() => {
          sendMessage(joinLobbyMsg)
        }} >
          join lobby
        </button>
      </div>
    </div>
    <div class="w-full flex flex-row items-center justify-center justify-items-center">
      <button class='btn' onclick={() => {
        sendMessage(newLobbyMsg)
      }}>create a new lobby</button>
    </div>
  </div>
  )
}

export default JoinOrCreateLobby
