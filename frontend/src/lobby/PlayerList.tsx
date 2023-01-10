import { Component, For, Show } from "solid-js";
import { TPlayer } from "../types";

const PlayerList: Component<{
  players: TPlayer[];
  pointsKey: "points" | "points_current_round";
}> = (props) => {
  return (
    <For
      each={props.players.sort(
        (a: TPlayer, b: TPlayer) =>
          (b[0]?.[props.pointsKey] ?? 0) - (a[0]?.[props.pointsKey] ?? 0) ?? []
      )}
    >
      {(player: TPlayer) => (
        <>
          <span> {player[0].name} : </span>
          <span> {player[0][props.pointsKey] ?? 0} </span>
        </>
      )}
    </For>
  );
};

export default PlayerList;
