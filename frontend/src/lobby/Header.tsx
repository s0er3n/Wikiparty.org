import { Accessor, Component, Show, For } from "solid-js";
import { sendMessage } from "../App";

import Article from "../Article";
import Timer from "../Timer";
import { TLobby, TPlayer } from "../types";
import { ForwardButton, BackButton } from "./NavigationButtons";

const Header: Component<{
  id: string | null;
  lobby: Accessor<TLobby | null>;
}> = (props) => {
  const player = () =>
    props.lobby()?.players.find((player) => player[0]?.id === props?.id);

  const articles_to_find_with_points = () => {
    return props
      .lobby()
      .articles_to_find?.filter((article) => {
        return !player()[1]
          .moves.map((move: { pretty_name: string }) => move.pretty_name)
          ?.includes(article);
      })
      .map((article) => {
        return {
          title: article,
          points: props.lobby().articles_found?.includes(article) ? 10 : 15,
        };
      });
  };
  return (

    <div class="bg-base-200 p-3 sticky top-0 z-50 ">
      <div>
        <div class="navbar rounded-md shadow-md bg-base-100 mb-3">
          <div class="flex-1">
            <a
              href="/"
              onclick={() => {
                let leaveMsg = {
                  method: "leave_lobby",
                  type: "lobby",
                  args: {},
                };
                sendMessage(leaveMsg);
              }}
              class="btn btn-ghost normal-case text-xl"
            >
              WikiParty.org (pre-alpha)
            </a>
          </div>

          <div class="flex-none space-x-3">
            <Show when={props.lobby()}>
              <Show when={props.lobby()?.state === "ingame"}>
                <BackButton />
                <ForwardButton />
              </Show>
              <Show when={props.lobby().state === "ingame"}>
                <Timer validTill={props.lobby().end_time} />
              </Show>{" "}
              <input
                class="hidden md:block input input-bordered"
                onclick={async () => {
                  await navigator.clipboard.writeText(props.lobby().id);
                }}
                value={props.lobby().id}
                readonly
              ></input>
              <button
                onclick={async () => {
                  await navigator.clipboard.writeText(props.lobby().id);
                }}
                class="btn"
              >
                copy
              </button>
            </Show>
          </div>
        </div>
      </div>

      <Show when={props.lobby()?.state === "ingame"}>
        <div class="bg-base-100 mt-3 shadow-md rounded-md p-2 ">
          <span> Articles to find: </span>
          <For each={articles_to_find_with_points()}>
            {(article) => (
              <>
                <Article
                  points={article.points}
                  title={article.title}
                  articles_to_find={props.lobby()?.articles_to_find}
                />
                <span> </span>
              </>
            )}
          </For>
        </div>
      </Show>
      <div class="mt-3" style="display: flex; justify-content: space-between;">
        <div class="alert alert-warning shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              WARNING: This game is really new. Join our Discord if you have
              suggestions or bugs:
              <a
                class="ml-2 font-bold underline"
                href="https://discord.gg/GvqXjxc3xx"
              >
                https://discord.gg/GvqXjxc3xx
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
