import {
  Show,
  Component,
  createEffect,
  createSignal,
  Accessor,
  For,
} from "solid-js";

import { sendMessage } from "./../App";
import PlayerList from "./PlayerList";
import type { TLobby } from "../types";
import { isHost, setGoToLobby } from "./Lobby";

let startGameMsg = { type: "game", method: "start", args: {} };

let setTimeMsg = {
  type: "game",
  method: "set_time",
  args: { time: 0 },
};

type Props = {
  id?: string;
  lobby: Accessor<TLobby | null>;
};

const LobbyOverview: Component<any> = (props) => {
  return (
    <div class="flex justify-center bg-base-100 rounded-md shadow-md p-3">
      <div class="flex flex-col justify-between space-y-3">
        <h3 class="text-xl font-bold">Settings:</h3>
        <div>
          <b>start:</b>{" "}
          <span
            class="tooltip tooltip-bottom"
            data-tip={props.lobby().start_article_description}
          >
            {props.lobby().start_article}
          </span>
        </div>
        <div>
          <b>find: </b>
          <For each={props.lobby().articles_to_find}>
            {(article, i) => (
              <>
                <Show when={i()}>
                  <span> | </span>
                </Show>
                <span
                  class="tooltip tooltip-bottom"
                  data-tip={props.lobby().articles_to_find_description[article]}
                >
                  {article}
                </span>
              </>
            )}
          </For>
          <button
            class="mx-2"
            onclick={() => {
              setGoToLobby(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2a2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></g></svg>
          </button>
        </div>
        <div class="flex w-full justify-center items-center">
          <span class="mr-2">time: </span>
          <SetTime time={props.lobby().time} id={props.id} lobby={props.lobby} />
          <span class="ml-2"> minutes</span>
        </div>
        <Show when={isHost(props)} article>
          <p>
            <button
              class="btn btn-wide"
              onclick={() => {
                sendMessage(startGameMsg);
              }}
            >
              start game
            </button>
          </p>
          <h3 class="text-xl font-bold">How do I get Points?</h3>
          <p>
            for every article you find you get 10 points and 5 extra points if
            you are the first person to find the article
          </p>
          <h3 class="text-xl font-bold">When does the game end?</h3>
          <p>
            the game ends if one person has found every article or the time runs
            out
          </p>
        </Show>
        <div>
          <h3 class="text-xl font-bold">Players in Lobby:</h3>
          <PlayerList
            players={props.lobby()?.players}
            pointsKey="points"
            id={props.id}
          />
        </div>
      </div>
    </div>
  );
};

const setTime = (e: any) => {
  let msg = setTimeMsg;
  msg.args.time = parseInt(e.target.value * 60);
  sendMessage(msg);
};

const SetTime: Component<any> = (props) => {
  let time = Math.floor(props.time / 60);
  return (
    <Show when={isHost({ lobby: props.lobby, id: props.id })} fallback={
      <input
        class="w-24"
        value={time}
        min="1"
        disabled
        type="number"
        class="input input-bordered"
      />
    }>
      <input
        class="w-24"
        value={time}
        min="1"
        onchange={setTime}
        type="number"
        class="input input-bordered"
      />
    </Show>
  );
};

export default LobbyOverview;
