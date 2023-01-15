import { Component, For, Show, createSignal } from "solid-js";
import { TPlayer } from "../types";
import { sendMessage } from "../App";
import { setUserNameMsg } from "../SetUserName";

let [changeName, setChangeName] = createSignal<boolean>(false);
const [container, setContainer] = createSignal<HTMLDivElement>();

const PlayerList: Component<{
  players: TPlayer[];
  pointsKey: "points" | "points_current_round";
  id: string;
}> = (props) => {
  let id = localStorage.getItem("id");
  let [userName, setUserName] = createSignal<string>(props.players.find(player =>
    player[0].id === id
  )[0].name);

  return (
    <For
      each={props.players.sort(
        (a: TPlayer, b: TPlayer) =>
          (b[0]?.[props.pointsKey] ?? 0) - (a[0]?.[props.pointsKey] ?? 0) ?? []
      )}
    >
      {(player: TPlayer) => (
        <>
           <div class="w-fit">
            <Show when={!changeName() || player[0].id !== id}
              fallback={
                <span onkeyup={(key) => {
                  if (key.key == "Enter" || key.key == "Escape") {
                    setChangeName(false)
                  }
                }
                }>
                  <input
                    ref={setContainer}
                    value={userName()}
                    onchange={(e) => {
                      let msg = setUserNameMsg;
                      setUserName(e.target.value)
                      setUserNameMsg.args.name = userName();
                      sendMessage(msg);
                      localStorage.setItem("username", userName());
                    }}
                    onblur={() => setChangeName(false)}
                  >
                    {player[0].name.length > 12
                      ? player[0].name.substring(0, 12)
                      : player[0].name}
                    :{" "}
                  </input>
                </span>
              }>
        
            <span class="font-light" onclick={() => {
                if (player[0].id == props.id) {
                  setChangeName(true)
                  container()?.focus()
                }
              }>
              {player[0].name.length > 12
                ? player[0].name.substring(0, 12)
                : player[0].name}
            </span>
            </Show>
            :<span class="font-bold"> {player[0][props.pointsKey] ?? 0} </span>
          </div>
        </>
      )}
    </For>
  );
};

export default PlayerList;
