import { Component, createEffect, createSignal } from "solid-js";

import { sendMessage, startWS } from "./App";
let [userName, setUserName] = createSignal<string>(``);

export let setUserNameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: userName() },
};

const SetUserNameComponent: Component<any> = (props) => {
  return (
    <div class="w-full flex flex-row items-center justify-center justify-items-center">
      <div class="bg-base-100 shadow-md rounded-md p-3">
        <div class="flex space-x-3">
          <input
            value={userName()}
            onchange={(e) => setUserName(e.target.value)}
            minlength="2"
            maxlength="12"
            type="text"
            class="input input-bordered w-3/4"
          />
          <button
            class="btn "
            onclick={() => {
              if (userName().length > 3) {
                let msg = setUserNameMsg;
                setUserNameMsg.args.name = userName();
                sendMessage(msg);
                localStorage.setItem("username", userName());
                props.setHasUserName(true);
                startWS();
              } else {
                alert("user name should be longer than 3 chars");
              }
            }}
          >
            set username
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetUserNameComponent;
