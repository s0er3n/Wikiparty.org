import { Component, For } from "solid-js";
import { TPlayer } from "../types";

const PlayerList: Component<{ players: TPlayer[] }> = (props) => {
  return (
    <For each={props.players.sort((p: TPlayer) => p[0]?.points ?? 0) ?? []}>
      {(player: TPlayer) => (
        <>
          <span> {player[0].name}:</span>
          <span> {JSON.stringify(player[0].points ?? 0)}</span>
        </>
      )}
    </For>
  );
};

export default PlayerList;
