import { Show, Component, createEffect, createSignal } from "solid-js";

import { sendMessage } from "./../App";
import { isHost } from "./Lobby";
import PlayerList from "./PlayerList";

let startGameMsg = { type: "game", method: "start", args: {} };

let setTimeMsg = {
  type: "game",
  method: "set_time",
  args: { time: 0 },
};

type Props = {
  time: number;
};

const SetTimePage = (props) => {
  return (
    <div class="flex justify-center">
      <div>
        <div>Articles:</div>
        <div>start: {props.lobby().start_article}</div>
        <div>find: {props.lobby().articles_to_find.join(" | ")}</div>
        <div>
          for every article you find you get 10 points and 5 extra points if
          you are the first person to find the article
        </div>
        <div>max time: </div>
        <SetUserNameComponent time={props.lobby().time} />
        <Show when={isHost(props)}>
          <button
            class="btn"
            onclick={() => {
              sendMessage(startGameMsg);
            }}
          >
            start game
          </button>
          <PlayerList players={props.lobby()?.players} />
        </Show>
      </div>
    </div>
  )
};

const setTime = (e: any) => {
  let msg = setTimeMsg;
  msg.args.time = parseInt(e.target.value);
  sendMessage(msg);
};

const SetUserNameComponent: Component<Props> = (props) => {
  return (
    <input
      value={props.time}
      onchange={setTime}
      type="text"
      class="input input-bordered"
    />
  );
};

export default SetTimePage;
