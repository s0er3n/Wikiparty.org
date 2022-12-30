import { Accessor, Component, Show, For } from "solid-js";

const Header: Component<{ id: string | null, lobby: Accessor<{ state: string, id: string, players: any, articles_to_find: Array<String>, articles_found: any }> }> = (props) => {
  const player = () => props.lobby().players.find((player) => player[0].id === props.id);
  return (
    <div class="sticky top-0">
      <div class="navbar bg-base-100 bg-slate-500 z-50">
        <div class="flex-1">
          <a class="btn btn-ghost normal-case text-xl">Better WikiGame</a>
        </div>
        <Show when={props.lobby()}>
          <div class="flex-none space-x-2 ">
            <input
              class="hidden md:block input input-bordered"
              onclick={async () => {
                await navigator.clipboard.writeText(props.lobby().id);
              }}
              value={props.lobby().id}
              readonly
            ></input>
            <button
              onclick={async () => {
                await navigator.clipboard.writeText(props.lobby().id);
              }}
              class="btn"
            >
              copy
            </button>
          </div>
        </Show>
      </div>
      <Show when={props.lobby()?.state === "ingame"}>
        <div class="font-bold bg-gray-500 z-50">
          <div class="flex">
            <For each={props.lobby()?.players ?? []}>
              {(player: any, i) => {
                return (
                  <div class="ml-2">
                    <div>
                      {player[0].name} : {player[0].points}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          Find these Articles:{" "}
          {props.lobby()
            .articles_to_find?.filter((article) => {
              return !player()[1]
                .moves.map((move) => move.pretty_name)
                ?.includes(article);
            })
            .map(
              (article) =>
                article +
                " " +
                (props.lobby().articles_found?.includes(article) ? "10" : "15")
            )
            .join(" | ")}
        </div>
      </Show>
    </div>
  );
};

export default Header;
