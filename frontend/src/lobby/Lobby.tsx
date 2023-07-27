import {
  Accessor,
  Component,
  Show,
  splitProps,
  Setter,
  createSignal,
  createEffect,
} from "solid-js";
import LobbyOverview from "./LobbyOverview";
import GameOver from "./GameOver";
import Wiki from "./Wiki";
import SetupGame from "./SetupGame";
import type { TLobby, TPlayer } from "../types";

export const [goToLobby, setGoToLobby] = createSignal(false);

export const isHost = (props: {
  id?: string;
  lobby: Accessor<TLobby | null>;
}) => {
  // find host
  const host = props?.lobby()?.players.find((p) => p[1].rights === "host");
  if (!host) return false;
  return host[0].id == props.id && props.id; // checks for not null
};

const Lobby: Component<{
  players: Accessor<TPlayer[] | null>
  setGoToLobby: Setter<boolean>;
  search: any;
  id: string | undefined;
  wiki: any;
  lobby: Accessor<TLobby | null>;
}> = (props) => {
  let state = () => props.lobby()?.state


  return (
    <div class="flex justify-center">
      <div class="">
      
        <Show
          when={
            state() === "idle" &&
            !goToLobby() &&
            isHost({ lobby: props.lobby, id: props.id })
          }
        >
          <SetupGame id={props.id} lobby={props.lobby} search={props.search} />
        </Show>
        <Show
          when={
            (props.lobby()?.state === "idle" &&
              props.lobby()?.start_article &&
              goToLobby()) ||
            (!isHost(props) && props.lobby()?.state === "idle")
          }
        >
          <LobbyOverview players={props.players} lobby={props.lobby} id={props.id} />
        </Show>
        <Show when={state() === "ingame"}>
          <Wiki lobby={props.lobby} />
        </Show>

        <Show when={state() === "over"}>
          <GameOver
            lobby={props.lobby}
            id={props.id}
            players={props.lobby()?.players}
          />
        </Show>
        </div>
        </div>
  );
};

export default Lobby;
