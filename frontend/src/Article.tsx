import { Component, Show, Accessor } from "solid-js";
import type { TLobby } from "./types";

const Article: Component<{
  articles_to_find: Array<any>;
  lobby: Accessor<TLobby | null>;
  title: string;
  points?: number;
}> = (props) => {
  return (
    <Show
      when={props.articles_to_find?.includes(props.title)}
      fallback={
        <>
          <span>{props.title}</span>{" "}
          {props.points ? "(" + props.points + ")" : ""}
        </>
      }
    >
      <>
        <span
          class="tooltip tooltip-bottom"
          data-tip={props.lobby().articles_to_find_description[props.title]}
        >
          <span class="font-black">{props.title}</span>{" "}
        </span>
        {props.points ? "(" + props.points + ")" : ""}
      </>
    </Show>
  );
};

export default Article;
