import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";
import SetArticle from "./SetArticle";

const SetArticleHeadline: Component<{ lobby: any }> = (props) => {
  return (
    <Show
      when={props.lobby().start_article}
      fallback={
        <h1 class="mt-5 text-3xl font-light">Search for a page to start:</h1>
      }
    >
      <h1 class="mt-5 text-3xl font-light">
        Search for a page or pages to find:
      </h1>
    </Show>
  );
};

const SetupGame: Component<{
  id: any;
  lobby: any;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  console.log("SetupGame", props.search());
  return (
    <div class="bg-base-100 shadow-md rounded-md p-3">
      <p>
        <b>start article:</b> {props.lobby().start_article}
      </p>
      <p>
        <b>articles to find:</b> {props.lobby().articles_to_find.join(" | ")}
      </p>
      <SetArticleHeadline lobby={props.lobby} />

      <SetArticle lobby={props.lobby} search={props.search} />
    </div>
  );
};

export default SetupGame;
