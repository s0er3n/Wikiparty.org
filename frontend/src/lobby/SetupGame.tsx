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
        <h1 class="font-light">
          <Trans key="setArticle.start" />
        </h1>
      }
    >
      <h1 class="font-light">
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
    <div class="bg-base-100 shadow-md rounded-md p-3 max-w-lg">
      <div class="flex justify-center">
        <SetLang lobby={props.lobby} />
      </div>
      <div class="divider max-w-full"></div>
      <div class="mx-2 font-thin text-sm break-words">
        <p>
          <Trans key="setArticle.start" /> <span class="font-bold"> {props.lobby().start_article}</span>
        </p>
        <div class="p-2" />
        <p>
          <Trans key="setArticle.articlesToFind" />
          <For each={props.lobby().articles_to_find}>
            {(article, i) => (
              <>
                <Show when={i()}>
                  <span> | </span>
                </Show>
                <span
                  class="tooltip tooltip-bottom"
                  data-tip={props.lobby().articles_to_find_description[article]}
                >
                  <span class="font-bold">{article}</span>
                </span>
              </>
            )}
          </For>
        </p>
      </div>

      <div class="flex flex-col w-full border-opacity-50">
        <div class="divider"></div>
      </div>
      <div class="mx-2">
        <SetArticleHeadline lobby={props.lobby} />
      </div>

      <SetArticle lobby={props.lobby} search={props.search} />
    </div >
  );
};

export default SetupGame;
