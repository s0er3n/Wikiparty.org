import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";
import SetArticle from "./SetArticle";

const SetArticleHeadline: Component<{ lobby: any }> = (props) => {
  return (
    <Show
      when={props.lobby().start_article}
      fallback={<h1>Search for a page to start:</h1>}
    >
      <h1>Search for a page or pages to find:</h1>
    </Show>
  );
};

const SetupGame: Component<{
  id: any;
  lobby: any;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  return (
    <>
      <p>
        <b>start article:</b> {props.lobby().start_article}
      </p>
      <p>
        <b>articles to find:</b> {props.lobby().articles_to_find.join(" | ")}
      </p>
      <SetArticleHeadline lobby={props.lobby} />

      <SetArticle lobby={props.lobby} search={props.search} />
      <Show
        when={
          props.lobby().state === "idle" &&
          props.lobby().articles_to_find.length &&
          props.lobby().start_article &&
          isHost(props)
        }
      >
        <button
          class="btn m-2"
          onclick={() => {
            setGoToLobby(true);
          }}
        >
          go to lobby
        </button>
      </Show>
    </>
  );
};

export default SetupGame;
