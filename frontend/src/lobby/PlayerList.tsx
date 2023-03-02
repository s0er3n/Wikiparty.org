import { Accessor, Component, For, Show, createSignal } from "solid-js";
import { TPlayer } from "../types";

export const [username, setUsername] = createSignal<string>("");

const PlayerList: Component<{
  players: Accessor<TPlayer[] | null>;
  pointsKey: "points" | "points_current_round";
  id: string;
}> = (props) => {
  let id = localStorage.getItem("id");
  setUsername(props.players().find(player => player[0].id === id)[0].name);

  return (
    <For
      each={props.players()?.sort(
        (a: TPlayer, b: TPlayer) =>
          (b[0]?.[props.pointsKey] ?? 0) - (a[0]?.[props.pointsKey] ?? 0) ?? []
      )}
    >
      {(player: TPlayer) => (
        <div class="w-fit">
          <Show when={player[0].id == props.id} fallback={
            <>
              <span class="font-light" onclick={() => {
                if (player[0].id == props.id) {
                }
              }
              }>
                {player[0].name.length > 12
                  ? player[0].name.substring(0, 12)
                  : player[0].name}
              </span>
              :<span class="font-bold"> {player[0][props.pointsKey] ?? 0} </span>
            </>
          }>
            <p>
              <label for="my-modal-6" >
                <span class="font-light " onclick={() => {
                  if (player[0].id == props.id) {
                  }
                }
                }>
                  {player[0].name.length > 12
                    ? player[0].name.substring(0, 12)
                    : player[0].name}
                </span>
              </label >
              :<span class="font-bold"> {player[0][props.pointsKey] ?? 0} </span>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 700 750" class="inline">
                <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" />
              </svg>
            </p>
          </Show>
        </div>
      )}
    </For>
  );
};

export default PlayerList;
