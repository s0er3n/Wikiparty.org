import { Accessor, Component, Show, For } from "solid-js";

import Article from "../Article";
import Timer from "../Timer";
import { TLobby, TPlayer } from "../types";
import { ForwardButton, BackButton } from "./NavigationButtons";

const Header: Component<{
  id: string | null;
  lobby: Accessor<TLobby | null>;
}> = (props) => {
  const player = () =>
    props.lobby()?.players.find((player) => player[0]?.id === props?.id);

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
    <div style="margin-bottom: 5px; border-bottom: 2px solid black; position: sticky; top: 0;  background-color: rgba(255,255,255,1);">
      <h1>
        <a href="/" class="btn btn-ghost normal-case text-xl">
          WikiParty.org (pre-alpha)
        </a>
      </h1>
      <div style="display: flex; justify-content: space-between;">
        <Show when={props.lobby()?.state === "ingame"}>
          <p align="left">
            <BackButton />
            <ForwardButton />
          </p>
        </Show>
        <Show when={props.lobby()}>
          <b>
            WARNING: This game is really new, so write me on discord if you
            experience any bugs or have suggestions (Sören#1141)
          </b>
          <p align="right">
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
            <Show when={props.lobby().state === "ingame"}>
              <Timer validTill={props.lobby().end_time} />
              <span> </span>
            </Show>
          </p>
        </Show>
      </div>
      <Show when={props.lobby()?.state === "ingame"}>
        <div>
          <span> Articles to find: </span>
          <For each={articles_to_find_with_points()}>
            {(article) => (
              <>
                <Article points={article.points} title={article.title} />{" "}
                <span> </span>
              </>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default Header;
