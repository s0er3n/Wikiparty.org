import { Accessor, Component, createSignal, For, Show } from "solid-js";
import SetLang from "./LangSelection";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"
import SetArticle from "./SetArticle";

const SetArticleHeadline: Component<{ lobby: any }> = (props) => {
  return (
    <Show
      when={props.lobby().start_article}
      fallback={
        <h1 class="mt-5 text-3xl font-light">
          <Trans key="setArticle.start" />
        </h1>
      }
    >
      <h1 class="mt-5 text-3xl font-light">
        <Trans key="setArticle.selectNextArticle" />
      </h1>
    </Show>
  );
};

const SetupGame: Component<{
  id: any;
  lobby: any;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  return (
    <div class="bg-base-100 shadow-md rounded-md p-3">
      <div class="w-full flex justify-center">
        <SetLang lobby={props.lobby} />
      </div>
      <p>
        <b><Trans key="setArticle.start" /></b> {props.lobby().start_article}
      </p>
      <p>
        <b><Trans key="setArticle.articlesToFind" /></b> {props.lobby().articles_to_find.join(" | ")}
      </p>
      <SetArticleHeadline lobby={props.lobby} />

      <SetArticle lobby={props.lobby} search={props.search} />
    </div >
  );
};

export default SetupGame;
