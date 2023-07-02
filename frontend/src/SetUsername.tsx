import { Component, createEffect, createSignal } from "solid-js";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"
import { sendMessage, startWS } from "./App";
let [username, setUsername] = createSignal<string>(`Anonymous-${Math.floor(Math.random() * 100)}`);

export let setUsernameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: username() },
};

const SetUsernameComponent: Component<any> = (props) => {
  return (
    <div class="w-full flex flex-row items-center justify-center justify-items-center">
      <div class="bg-base-100 shadow-md rounded-md p-3">
        <div class="flex space-x-3">
          <input
            value={username()}
            onchange={(e) => setUsername(e.target.value)}
            minlength="1"
            maxlength="12"
            type="text"
            class="input input-bordered w-3/4"
          />
          <button
            class="btn "
            onclick={() => {
              if (username().length > 3) {
                let msg = setUsernameMsg;
                setUsernameMsg.args.name = username();
                sendMessage(msg);
                localStorage.setItem("username", username());
                props.setHasUsername(true);
                startWS();
              } else {
                alert("user name should be longer than 3 chars");
              }
            }}
          >
            <Trans key="setUserName.submit" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetUsernameComponent;
