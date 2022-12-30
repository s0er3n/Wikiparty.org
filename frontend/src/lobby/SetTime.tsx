import { Component, createEffect, createSignal } from "solid-js";

import { sendMessage } from "./../App";

let setTimeMsg = {
  type: "game",
  method: "set_time",
  args: { time: 0 },
};
type Props = {
  time: number;
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

export default SetUserNameComponent;
