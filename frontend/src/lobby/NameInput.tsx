import { Component, createSignal } from "solid-js";

import { username, setUsername } from "./PlayerList"
import { setUsernameMsg } from "../SetUsername";
import { sendMessage } from "../App";


const NameInput: Component = () => {
  const [tempUsername, setTempUsername] = createSignal<string>(username())

  return (
    <>
      <input type="checkbox" id="my-modal-6" class="modal-toggle" />
      <div class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Change username</h3>
          <form>
            <input
              class="input input-bordered"
              value={tempUsername()}
              minlength="2"
              maxlength="12"
              onchange={(e) => {
                setTempUsername(e.target.value)
              }}
            >
            </input>
            <div class="modal-action">
              <label onclick={() => {
                setTempUsername(username())
              }} for="my-modal-6" class="btn">Cancel</label>
              <label onclick={() => {
                let msg = setUsernameMsg;
                setUsername(tempUsername())
                setUsernameMsg.args.name = tempUsername();
                sendMessage(msg);
                localStorage.setItem("username", tempUsername());
              }} for="my-modal-6" class="btn">
                Submit
              </label>

            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default NameInput
