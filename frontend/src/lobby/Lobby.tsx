import { Accessor, For, Component, createEffect, Show, splitProps, Setter } from "solid-js";
import SetArticle from "./SetArticle";
import SetTime from "./SetTime";
import { sendMessage } from "./../App";
import GameOver from "./GameOver";
import Wiki from "./Wiki";

let startGameMsg = { type: "game", method: "start", args: {} };

export const isHost = (local: any) => {
  // TODO: this is assuming the host is always the first player
  // check for player rights
  return local.lobby().players[0][0].id == local.id;
};


const Lobby: Component<{
  goToLobby: Accessor<any>, setGoToLobby: Setter<boolean>, search: any, id: string | null, wiki: any,
  lobby: Accessor<{ players: any, state: string, start_article: Array<string>, goToLobby: any, articles_to_find: Array<string>, time: any }>
}> = (props) => {

  const [local, others] = splitProps(props, ["setGoToLobby", "lobby", "search", "id", "goToLobby", "wiki"])
  const player = () => local.lobby().players.find((player) => player[0].id === local.id);

  const PlayerList: Component = () => {
    return (
      <ul>
        <For each={local.lobby()?.players ?? []}>
          {(player: any, i) => (
            <li>
              <span class="font-bold">{player[0].name}</span>
              <span class="ml-2">{JSON.stringify(player[0].points ?? 0)}</span>
            </li>
          )}
        </For>
      </ul>
    );
  };

  return (
    <>
      <Show
        when={local.lobby().state === "idle" && !local.lobby().start_article && isHost(local)}
      >
        <div class="flex justify-center font-bold">
          Search for a page to start:
        </div>
        <SetArticle lobby={local.lobby} search={local.search} />
      </Show>
      <Show
        when={
          local.lobby().state === "idle" &&
          local.lobby().start_article &&
          !local.goToLobby() &&
          isHost(local)
        }
      >
        <div class="flex justify-center font-bold">
          Search for a page or pages to find:
        </div>
        <SetArticle lobby={local.lobby} search={local.search} />
        <Show
          when={
            local.lobby().state === "idle" &&
            local.lobby().articles_to_find.length &&
            isHost(local)
          }
        >
          <div class="flex justify-center">
            <button
              class="btn m-2"
              onclick={() => {
                local.setGoToLobby(true);
              }}
            >
              go to lobby
            </button>
          </div>
        </Show>
      </Show>
      <Show
        when={
          (local.lobby().state === "idle" && local.lobby().start_article && local.goToLobby()) ||
          (!isHost(local) && local.lobby().state === "idle")
        }
      >
        <div class="flex justify-center">
          <div>
            <div>Articles:</div>
            <div>start: {local.lobby().start_article}</div>
            <div>find: {local.lobby().articles_to_find.join(" | ")}</div>
            <div>
              for every article you find you get 10 points and 5 extra points if
              you are the first person to find the article
            </div>
            <div>max time: </div>
            <SetTime time={local.lobby().time} />
            <Show when={isHost(local)}>
              <button
                class="btn"
                onclick={() => {
                  sendMessage(startGameMsg);
                }}
              >
                start game
              </button>
              <PlayerList local={local} />
            </Show>
          </div>
        </div>
      </Show>
      <Show when={local.lobby().state === "ingame"}>
        <Wiki wiki={local.wiki} />
      </Show>

      <Show when={local.lobby().state === "over"}>
        <GameOver players={local.lobby().players} />
      </Show>
    </>
  );
};

export default Lobby;
