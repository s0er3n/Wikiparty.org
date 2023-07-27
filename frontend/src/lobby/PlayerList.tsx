import { Accessor, Component, For, Show, createSignal } from "solid-js";
import { TPlayer } from "../types";

export const [username, setUsername] = createSignal<string>("");

const PlayerList: Component<{
  players: Accessor<TPlayer[] | null>;
  pointsKey: "points" | "points_current_round";
  id: string;
}> = (props) => {
  let id = localStorage.getItem("id");
  setUsername(props.players()?.find(player => player[0].id === id)?.[0]?.name ?? '');

  return (
    <For
      each={props.players()?.sort(
        (a: TPlayer, b: TPlayer) =>
          (b[0]?.[props.pointsKey] ?? 0) - (a[0]?.[props.pointsKey] ?? 0) ?? []
      )}
    >
      {(player: TPlayer) => (
        <div class="w-fit" >
          <Show when={player[0].id == props.id} fallback={
            <>
              <span class="font-bold"> {player[0][props.pointsKey] ?? 0} </span>
              <span class="font-light" >
                {player[0].name.length > 12
                  ? player[0].name.substring(0, 13)
                  : player[0].name}
              </span>
            </>
          }>
            <p
              onclick={() => {
                if (player[0].id == props.id) {
                }
              }
              }
            >
              <span class="font-bold"> {player[0][props.pointsKey] ?? 0} </span>
              <label for="my-modal-6" >
                <span class="font-medium " onclick={() => {
                  if (player[0].id == props.id) {
                  }
                }
                }>
                  {player[0].name.length > 12
                    ? player[0].name.substring(0, 13)
                    : player[0].name}
                </span>
              </label >

            </p>
          </Show>
        </div>
      )}
    </For>
  );
};

export default PlayerList;
