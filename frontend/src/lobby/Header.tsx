import { Accessor, Component, Show, For } from "solid-js";
import { sendMessage } from "../App";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"
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
    <div id="header" class="bg-base-200 p-3 sticky top-0 z-50 ">
      <div>
        <div class="navbar rounded-md shadow-md bg-base-100 mb-3">
          <div class="flex-1">
            <div
              // href="/"
              onclick={() => {
                let leaveMsg = {
                  method: "leave_lobby",
                  type: "lobby",
                  args: {},
                };
                sendMessage(leaveMsg);
                window.location.href = "/";
              }}
              class=" text-center sm:flex btn normal-case text-xl"
            >
              <span class="hidden md:flex">WikiParty.org (alpha)</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="md:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
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
                class="btn hidden md:block"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-clipboard"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
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
                  lobby={props.lobby}
                  articles_to_find={props.lobby()?.articles_to_find}
                />
                <span> </span>
              </>
            )}
          </For>
        </div>
      </Show>
      <div class="mt-3" style="display: flex; justify-content: space-between;">
        <div class="hidden md:block alert alert-warning  dark:alert-info shadow-lg">
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
            <span >
              <Trans key="notice" />
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
