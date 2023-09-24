import { Component, createEffect, createSignal } from "solid-js";

import { sendMessage } from "./App";
let [idToJoin, setIdToJoin] = createSignal<string>("");

import { Trans, useTransContext } from "@mbarzda/solid-i18next"
let joinLobbyMsg = {
  type: "lobby",
  method: "join_lobby",
  args: { id: idToJoin() },
};

createEffect(() => {
  joinLobbyMsg = {
    type: "lobby",
    method: "join_lobby",
    args: { id: idToJoin() },
  };
});

let newLobbyMsg = { type: "lobby", method: "new_lobby", args: {} };

const JoinOrCreateLobby: Component = () => {
  let [t] = useTransContext()
  return (
    <div class="flex bg-base-100 shadow-md rounded-md p-3 md:flex-row flex-col">
      <div class="flex justify-center items-center p-2">
        <input
          oninput={(e) => setIdToJoin(e.currentTarget.value)}
          type="text"
          placeholder={t("createOrJoinLobby.input")}
          class="input input-bordered "
        />
      </div>
      <div class="p-2">
        <button
          class="btn "
          onclick={() => {
            sendMessage(joinLobbyMsg);
          }}
        >
          <Trans key="createOrJoinLobby.join" />
        </button>
      </div>
      <div class="p-2">
        <button
          class="btn"
          onclick={() => {
            sendMessage(newLobbyMsg);
          }}
        >
          <Trans key="createOrJoinLobby.create" />
        </button>

      </div >
    </div >
  );
};

export default JoinOrCreateLobby;
