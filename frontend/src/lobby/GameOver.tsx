import { Component, For, Show, Accessor } from "solid-js";
import Article from "../Article";
import { TPlayer } from "../types";
import { sendMessage } from "./../App";
import { isHost } from "./Lobby";
import type { TLobby } from "../types";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"

type Props = {
  players: TPlayer[] | undefined;
  // TOOD: invastigae whats happening here
  lobby: Accessor<TLobby | null>;
  id: any;
};

const PlayerList: Component<Props> = (props) => {
  if (!props.players) return <></>;
  return (
    <div class="shadow-md bg-base-100 rounded-md p-3">
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
              <span class="text-2xl font-light">
                {player[0].name} : + {player[0].points_current_round} (
                {player[0].points})
              </span>
              <ol>
                <For each={player[1].moves?.map((move) => move.pretty_name)}>
                  {(article, i) => (
                    <div class="text-sm font-light">
                      {i() + 1}{" "}
                      <Article
                        lobby={props.lobby}
                        articles_to_find={props.lobby()?.articles_to_find}
                        title={article}
                      />
                    </div>
                  )}
                </For>
              </ol>
              <div class="divider" />
            </div>
          )}
        </For>
      </div>

      <Show when={isHost({ lobby: props.lobby, id: props.id })}>
        <div class="flex justify-center">
          <button
            class="btn mt-3"
            onclick={() => {
              sendMessage({ type: "game", method: "go_to_lobby", args: {} });
            }}
          >
            <Trans key="setArticle.goToLobby" />
          </button>
        </div>
      </Show>
    </div>
  );
};

export default PlayerList;
