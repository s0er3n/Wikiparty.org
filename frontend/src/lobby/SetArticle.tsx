import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { sendMessage } from "./../App";
import RandomArticle from "./../RandomArticle";
import { isHost, setGoToLobby } from "./Lobby";
let [article, setArticle] = createSignal("");

const SetArticle: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  let timeout: any = null;
  return (
    <>
      <div class="bg-base-100 shadow-md rounded-md p-3">
        <div class="flex space-x-3">
          <input
            class="input input-bordered"
            onkeyup={(e: any) => {
              if (timeout != null) {
                clearTimeout(timeout);
              }
              timeout = setTimeout(() => {
                const searchMsg = {
                  type: "search",
                  method: "execute",
                  args: {
                    query: e.target.value,
                  },
                };
                sendMessage(searchMsg);

                setArticle(e.target.value);
              }, 200);
            }}
            value={article()}
          />
          <RandomArticle
            setter={(random_article: string) => {
              const searchMsg = {
                type: "search",
                method: "execute",
                args: {
                  query: random_article,
                },
              };
              sendMessage(searchMsg);
              setArticle(random_article);
            }}
          />
          <Show
            when={
              props.lobby().state === "idle" &&
              props.lobby().articles_to_find.length &&
              props.lobby().start_article
            }
          >
            <button
              class="btn "
              onclick={() => {
                setGoToLobby(true);
              }}
            >
              go to lobby
            </button>
          </Show>
        </div>
        <Show when={article() !== ""}>
          <div class="p-3 space-y-3">
            <ArticleSuggestionsList search={props.search} lobby={props.lobby} />
          </div>
        </Show>
      </div>
    </>
  );
};

const ArticleSuggestionsList: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  return (
    <For each={props.search ? props?.search()?.at(3) ?? [] : []}>
      {(result, i) => (
        <div class="flex justify-between space-x-3">
          <div>
            <span> {props.search()?.at(1)?.at(i())} </span>
          </div>
          <div>
            <button
              onclick={() => {
                let setArticleMsg = {
                  type: "game",
                  method: "set_article",
                  args: {
                    url_name: result?.split("wiki/").pop(),
                    better_name: props.search()?.at(1)?.at(i()),
                    start: props.lobby().start_article === "",
                  },
                };
                sendMessage(setArticleMsg);
                setArticle("");
              }}
              class="btn"
            >
              select
            </button>
          </div>
        </div>
      )}
    </For>
  );
};
export default SetArticle;
