import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { TLobby } from "../types";
import { sendMessage } from "./../App";
import RandomArticle from "./../RandomArticle";
import { isHost, setGoToLobby } from "./Lobby";
let [article, setArticle] = createSignal("");

export interface SuggestArticle {
  batchcomplete: string;
  continue: Continue;
  query: Query;
}

export interface Continue {
  sroffset: number;
  continue: string;
}

export interface Query {
  searchinfo: Searchinfo;
  search: Search[];
}

export interface Search {
  ns: number;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  snippet: string;
  timestamp: Date;
}

export interface Searchinfo {
  totalhits: number;
}

const getWiki = async (name: string) => {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${name}&utf8=&format=json&origin=*`
  );
  const data: SuggestArticle = await res.json();
  return data.query;
};

const [sugestion, setSugestion] = createSignal<Query>();

const findArticle = async (name) => {
  let query = await getWiki(name);
  setSugestion(query);
  return query;
};

const SetArticle: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  let timeout: any = null;
  const regex_slash = new RegExp('[/]')
  return (
    <>
      <div class="bg-base-100 shadow-md rounded-md p-3">
        <div class="flex flex-col justify-center md:flex-row space-y-2 md:space-y-0  md:space-x-3">
          <input
            class="input input-bordered"
            type="text"
            pattern="[^/]+"
            onkeyup={(e: any) => {
              if (timeout != null) {
                clearTimeout(timeout);
              }
              timeout = setTimeout(() => {
                if (!regex_slash.exec(e.target.value)) {
                  findArticle(e.target.value);

                  setArticle(e.target.value);
                }
                else {
                  findArticle("")
                  console.log("dont use /")
                }
              }, 200);
            }}
            value={article()}
          />
          <RandomArticle
            setter={async (random_article: string) => {
              findArticle(random_article);
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
            <ArticleSuggestionsList query={sugestion()} lobby={props.lobby} />
          </div>
        </Show>
      </div>
    </>
  );
};

const ArticleSuggestionsList: Component<{
  query: Query;
  lobby: TLobby;
}> = (props) => {
  return (
    <For each={props?.query?.search ?? []}>
      {(result, i) => (
        <div class="flex justify-center space-x-3">
          <div>
            <span
              class="tooltip tooltip-bottom"
              data-tip={result.snippet.replace(/<[^>]+>/g, "") + "..."}
            >
              {" "}
              {result.title}{" "}
            </span>
          </div>
          <div>
            <button
              onclick={() => {
                let setArticleMsg = {
                  type: "game",
                  method: "set_article",
                  args: {
                    page_id: result.pageid,
                    better_name: result.title,
                    description: result.snippet.replace(/<[^>]+>/g, "") + "...",
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
