import { Component, createSignal } from "solid-js";

import { setContainer, setChangeName, userName, setUserName } from "./PlayerList"
import { setUserNameMsg } from "../SetUserName";
import { sendMessage } from "../App";

const [tempUsername, setTempUsername] = createSignal<string>()

const NameInput: Component = () => {
  setTempUsername(userName())

  return (
    <>
      < input type="checkbox" id="my-modal-6" class="modal-toggle" />
      <div class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Change user name</h3>
          <form>
            <input
              ref={setContainer}
              value={tempUsername()}
              minlength="2"
              maxlength="12"
              onchange={(e) => {
                setTempUsername(e.target.value)
              }}
              onblur={() => setChangeName(false)}
            >
            </input>
            <div class="modal-action">
              <label onclick={() => {
                setTempUsername(userName())
              }} for="my-modal-6" class="btn">cancle</label>
              <label onclick={() => {
                let msg = setUserNameMsg;
                setUserName(tempUsername())
                setUserNameMsg.args.name = tempUsername();
                sendMessage(msg);
                localStorage.setItem("username", tempUsername());
              }} for="my-modal-6" class="btn">
                Yay!
              </label>

            </div>
          </form>
        </div>
      </div >
    </>
  )
}

export default NameInput
