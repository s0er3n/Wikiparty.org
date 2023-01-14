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
          <div>
            <span>
              {player[0].name.length > 12
                ? player[0].name.substring(0, 12)
                : player[0].name}
              :{" "}
            </span>
            <span> {player[0][props.pointsKey] ?? 0} </span>
          </div>
        </>
      )}
    </For>
  );
};

export default PlayerList;
