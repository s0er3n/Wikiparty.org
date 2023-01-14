import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";
import SetArticle from "./SetArticle";

const SetArticleHeadline: Component<{ lobby: any }> = (props) => {
  return (
    <Show
      when={props.lobby().start_article}
      fallback={<p>Search for a page to start:</p>}
    >
      <p>Search for a page or pages to find:</p>
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
    <>
      <SetArticleHeadline lobby={props.lobby} />
      <SetArticle lobby={props.lobby} search={props.search} />
    </>
  );
};

export default SetupGame;
