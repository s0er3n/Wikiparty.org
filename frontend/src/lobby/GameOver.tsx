import { Component, For, Show, Accessor } from "solid-js";
import Article from "../Article";
import { TPlayer } from "../types";
import { sendMessage } from "./../App";
import { isHost } from "./Lobby";
import type { TLobby } from "../types";

type Props = {
  players: TPlayer[] | undefined;
  // TOOD: invastigae whats happening here
  lobby: Accessor<TLobby | null>;
};

const PlayerList: Component<Props> = (props) => {
  if (!props.players) return <></>;
  return (
    <div>
      <div>
        <For
          each={
            props.players.sort(
              (a: TPlayer, b: TPlayer) =>
                (b[0]?.points_current_round ?? 0) -
                (a[0]?.points_current_round ?? 0) ?? []
            ) ?? []
          }
        >
          {(player) => (
            <div>
              <span>{player[0].name} : </span>
              <span>
                + {player[0].points_current_round} ({player[0].points})
              </span>
              <ol>
                <For each={player[1].moves?.map((move) => move.pretty_name)}>
                  {(article, i) => (
                    <div>
                      {i() + 1} <Article articles_to_find={props.lobby()?.articles_to_find} lobby={props.lobby} title={article} />
                    </div>
                  )}
                </For>
              </ol>
            </div>
          )}
        </For>
      </div>

      <Show when={isHost(props)}>
        <p>
          <button
            class="btn mt-3"
            onclick={() => {
              sendMessage({ type: "game", method: "go_to_lobby", args: {} });
            }}
          >
            go to lobby
          </button>
        </p>
      </Show>
    </div>
  );
};

export default PlayerList;
