import { Component } from "solid-js";

const Article: Component<{ title: string; points?: number }> = (props) => {
  return (
    <>
      <b>
        {props.title} <i>{props.points ?? ""}</i>
      </b>
    </>
  );
};

export default Article;
