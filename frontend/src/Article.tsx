import { Component } from "solid-js";

const Article: Component<{ title: string; points: number }> = (props) => {
  return (
    <div
      class={`badge ${props?.points === 15 ? "badge-success" : "badge-warning"
        } gap-2 h-fit p-2 text-xs w-fit whitespace-nowrap`}
    >
      {props.title} {props.points ?? ""}
    </div>
  );
};

export default Article;
