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
    <div class="bg-base-100 shadow-md rounded-md p-3">
      <div class="md:flex ">
        <div class="md:flex space-y-1 md:space-y-0 space-x-1 md:space-x-3">
          <input
            onchange={(e) => setIdToJoin(e.target.value)}
            type="text"
            placeholder={t("createOrJoinLobby.input")}
            class="input input-bordered w-3/5"
          />
          <button
            class="btn "
            onclick={() => {
              sendMessage(joinLobbyMsg);
            }}
          >
            <Trans key="createOrJoinLobby.join" />
          </button>
        </div>
        <br />
        <button
          class="btn"
          onclick={() => {
            sendMessage(newLobbyMsg);
          }}
        >
          <Trans key="createOrJoinLobby.create" />
        </button>
      </div>
    </div >
  );
};

export default JoinOrCreateLobby;
