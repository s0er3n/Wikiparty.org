import { Component, For, Show } from "solid-js";
import { sendMessage } from "./../App";

let back_page_msg = { type: "game", method: "page_back", args: {} };

let forward_page_msg = { type: "game", method: "page_forward", args: {} };

export const BackButton: Component = () => {
  return (
    <button
      onclick={async () => {
        sendMessage(back_page_msg)
      }}
      class="btn"
    >

      Back
    </button>
  )
}

export const ForwardButton: Component = () => {
  return (
    <button
      onclick={async () => {
        sendMessage(forward_page_msg)
      }}
      class="btn"
    >

      Forward
    </button>
  )
}

