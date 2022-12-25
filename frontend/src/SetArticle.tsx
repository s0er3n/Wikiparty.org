import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { sendMessage } from "./App";

let [article, setArticle] = createSignal("");

const SetArticle: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  let timeout: any = null;
  return (
    <div class="flex flex-row justify-center ">
      <div>
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

        <Show when={article() !== ""}>
          <ul>
            <For each={props.search ? props?.search()?.at(3) ?? [] : []}>
              {(result, i) => (
                <li class="mt-2">
                  <button
                    onclick={() => {
                      let setArticleMsg = {
                        type: "game",
                        method: "set_article",
                        args: {
                          article: result.split("/").pop(),
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
                  <span class="ml-2 font-bold">
                    {props.search()?.at(1)?.at(i())}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
};

export default SetArticle;
