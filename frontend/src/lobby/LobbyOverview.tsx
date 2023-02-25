import {
  Show,
  Component,
  createEffect,
  createSignal,
  Accessor,
  For,
} from "solid-js";

import { sendMessage } from "./../App";
import { isHost } from "./Lobby";
import PlayerList from "./PlayerList";
import type { TLobby } from "../types";

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
