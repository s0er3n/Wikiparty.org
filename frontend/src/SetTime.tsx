import { Component, createEffect, createSignal } from "solid-js"

import { sendMessage } from "./App"

let setTimeMsg = {
  "type": "game",
  "method": "set_time",
  "args": { "time": 0 },
}
type Props = {
  time: number
}

const setTime = (e: any) => {
  let msg = setTimeMsg
  msg.args.time = parseInt(e.target.value)
  sendMessage(msg)
}
const SetUserNameComponent: Component<Props> = (props) => {
  return (<div class="w-full flex flex-row items-center justify-center justify-items-center">
    <div class="w-full flex flex-row items-center justify-center justify-items-center">
      <div class="input-group w-fit">
        <input value={props.time} onchange={setTime} type="text" placeholder="type in the code…" class="input input-bordered" />
      </div>
    </div>
  </div >
  )
}

export default SetUserNameComponent
