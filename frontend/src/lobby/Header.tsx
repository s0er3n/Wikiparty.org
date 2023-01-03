import { Accessor, Component, Show, For } from "solid-js";
import Article from "../Article";
import Timer from "../Timer";

import PlayerList from "./PlayerList";

const Header: Component<{
  id: string | null;
  lobby: Accessor<{
    state: string;
    id: string;
    end_time: number;
    players: any;
    articles_to_find: Array<string>;
    articles_found: any;
  }>;
}> = (props) => {
  const player = () =>
    props.lobby().players.find((player) => player[0].id === props.id);

  const articles_to_find_with_points = () => {
    return props
      .lobby()
      .articles_to_find?.filter((article) => {
        return !player()[1]
          .moves.map((move: { pretty_name: string }) => move.pretty_name)
          ?.includes(article);
      })
      .map((article) => {
        return {
          title: article,
          points: props.lobby().articles_found?.includes(article) ? 10 : 15,
        };
      });
  };
  return (
    <div class="sticky top-0 bg-base-100 bg-slate-500 z-50">
      <div class="navbar ">
        <div class="flex-1">
          <a href="/" class="btn btn-ghost normal-case text-xl">
            Better WikiGame
          </a>
        </div>
        <Show when={props.lobby()}>
          <Show when={props.lobby().state === "ingame"}>
            <Timer validTill={props.lobby().end_time} />
          </Show>
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
        <div class="font-bold">
          <div class="flex">
            <PlayerList players={props.lobby().players} />
          </div>
        </div>
        <div class="flex justify-center items-center space-x-2 p-2 overflow-hidden">
          <For each={articles_to_find_with_points()}>
            {(article) => (
              <Article points={article.points} title={article.title} />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default Header;
