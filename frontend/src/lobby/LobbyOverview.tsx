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
    <div class="flex justify-center bg-base-100 rounded-md shadow-md p-3 max-w-lg">
      <div class="flex flex-col justify-between space-y-3">
        <div class="mx-2 font-thin text-sm break-words">
          <p>
            <Trans key="setArticle.start" /> <span class="font-bold"> {props.lobby().start_article}</span>
          </p>
          <div class="p-2" />
          <p>
            <Trans key="setArticle.articlesToFind" />
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
                    <span class="font-bold">{article}</span>
                  </span>
                </>
              )}
            </For>
          </p>
        </div>
        <div class="divider max-w-full"></div>
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
        <div class="divider max-w-full"></div>
        <div>
          <div class="flex justify-around flex-wrap">
            <div class="flex justify-center text-center align-middle items-center">
              <SetTime time={props.lobby().time} id={props.id} lobby={props.lobby} />
              <span class="ml-2"> <Trans key="lobby.minutes" /></span>
            </div>
            <Show when={isHost({ lobby: props.lobby, id: props.id })}>
              <button
                class="btn btn-wide m-2"
                onclick={() => {
                  sendMessage(startGameMsg);
                }}
              >
                <Trans key="lobby.start" />
              </button>
            </Show>
          </div>
        </div>
        <div class="divider max-w-full"></div>
        <h3 class="text-xl">
          <Trans key="lobby.players" />
        </h3>
        <PlayerList
          players={props.players}
          pointsKey="points"
          id={props.id}
        />

        <NameInput />
      </div>
    </div >
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
