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

      <Show when={article() !== ""}>
        <ArticleSuggestionsList search={props.search} lobby={props.lobby} />
      </Show>
    </>
  );
};

const ArticleSuggestionsList: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  return (
    <ul>
      <For each={props.search ? props?.search()?.at(3) ?? [] : []}>
        {(result, i) => (
          <p>
            <span> {props.search()?.at(1)?.at(i())} </span>
            <button
              onclick={() => {
                let setArticleMsg = {
                  type: "game",
                  method: "set_article",
                  args: {
                    article: result?.split("wiki/").pop(),
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
          </p>
        )}
      </For>
    </ul>
  );
};
export default SetArticle;
