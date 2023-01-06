import { Component, For, Show } from "solid-js";
import Article from "../Article";
import { TPlayer } from "../types";
import { sendMessage } from "./../App";
import { isHost } from "./Lobby";

type Props = {
  players: TPlayer[] | undefined;
  // TOOD: invastigae whats happening here
  local: any;
};

const PlayerList: Component<Props> = (props) => {
  if (!props.players) return <></>;
  return (
    <div class="flex justify-center">
      <div>
        <ul>
          <For each={props.players ?? []}>
            {(player) => (
              <li>
                <div class="flex flex-row">
                  <div class="font-bold">{player[0].name}</div>
                  <div class="ml-2 ">{player[0].points}</div>
                  <div class="ml-2 flex flex-wrap breadcrumbs">
                    <ul>
                      <For
                        each={player[1].moves?.map((move) => move.pretty_name)}
                      >
                        {(article) => (
                          <li>
                            <Article title={article} />
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                </div>
              </li>
            )}
          </For>
        </ul>

        <Show when={isHost(props.local)}>
          <button
            class="btn mt-3"
            onclick={() => {
              sendMessage({ type: "game", method: "go_to_lobby", args: {} });
            }}
          >
            go to lobby
          </button>
        </Show>
      </div>
    </div>
  );
};

export default PlayerList;
