import {
  Accessor,
  Component,
  Show,
  splitProps,
  Setter,
  createSignal,
} from "solid-js";
import SetTime from "./SetTime";
import { sendMessage } from "./../App";
import GameOver from "./GameOver";
import Wiki from "./Wiki";
import PlayerList from "./PlayerList";
import SetupGame from "./SetupGame";

let startGameMsg = { type: "game", method: "start", args: {} };

export const [goToLobby, setGoToLobby] = createSignal(false);

export const isHost = (props: any) => {
  // TODO: this is assuming the host is always the first player
  // check for player rights
  return props.lobby().players[0][0].id == props.id;
};

const Lobby: Component<{
  setGoToLobby: Setter<boolean>;
  search: any;
  id: string | null;
  wiki: any;
  lobby: Accessor<{
    players: any;
    state: string;
    start_article: Array<string>;
    goToLobby: any;
    articles_to_find: Array<string>;
    time: any;
  }>;
}> = (props) => {
  const [local, others] = splitProps(props, [
    "setGoToLobby",
    "lobby",
    "search",
    "id",
    "wiki",
  ]);

  return (
    <>
      <Show
        when={
          props.lobby().state === "idle" &&
          !goToLobby() &&
          isHost(props)
        }
      >
        <SetupGame id={local.id} lobby={local.lobby} search={local.search} />
      </Show>
      <Show
        when={
          (local.lobby().state === "idle" &&
            local.lobby().start_article &&
            goToLobby()) ||
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
              <PlayerList players={local.lobby()?.players} />
            </Show>
          </div>
        </div>
      </Show>
      <Show when={local.lobby().state === "ingame"}>
        <Wiki wiki={local.wiki} />
      </Show>

      <Show when={local.lobby().state === "over"}>
        <GameOver local={local} players={local.lobby().players} />
      </Show>
    </>
  );
};

export default Lobby;
