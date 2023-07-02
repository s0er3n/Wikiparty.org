import {
  Show,
  Component,
  Accessor,
  For,
} from "solid-js";

import { sendMessage } from "./../App";
import { isHost } from "./Lobby";
import PlayerList from "./PlayerList";
import type { TLobby, TPlayer } from "../types";
import NameInput from "./NameInput";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"
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

const LobbyOverview: Component<{
  id?: string;
  lobby: Accessor<TLobby | null>
  players: Accessor<TPlayer[] | null>

}> = (props) => {
  return (
    <div class="flex justify-center bg-base-100 rounded-md shadow-md p-3">
      <div class="flex flex-col justify-between space-y-3">
        <h3 class="text-xl font-bold">Settings:</h3>
        <div>
          <b><Trans key="setArticle.start" /></b>{" "}
          <span
            class="tooltip tooltip-bottom"
            data-tip={props.lobby().start_article_description}
          >
            {props.lobby().start_article}
          </span>
        </div>
        <div>
          <b><Trans key="setArticle.articlesToFind" /></b>
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
          <span class="mr-2"><Trans key="lobby.time" /></span>
          <SetTime time={props.lobby().time} id={props.id} lobby={props.lobby} />
          <span class="ml-2"> <Trans key="lobby.minutes" /></span>
        </div>
        <Show when={isHost({ lobby: props.lobby, id: props.id })}>
          <p>
            <button
              class="btn btn-wide"
              onclick={() => {
                sendMessage(startGameMsg);
              }}
            >
              <Trans key="lobby.start" />
            </button>
          </p>
        </Show>
        <h3 class="text-xl font-bold">
          <Trans key="lobby.faq.points.q" />
        </h3>
        <p>
          <Trans key="lobby.faq.points.a" />
        </p>
        <h3 class="text-xl font-bold">
          <Trans key="lobby.faq.end.q" />
        </h3>
        <p>
          <Trans key="lobby.faq.end.a" />
        </p>
        <div>
          <h3 class="text-xl font-bold">Players in Lobby:</h3>
          <PlayerList
            players={props.players}
            pointsKey="points"
            id={props.id}
          />
        </div>
      </div>
      <NameInput />
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
