import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { TLobby } from "../types";
import { Trans, useTransContext } from "@mbarzda/solid-i18next"

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

const getWikiPreview = async (name: string, language: string) => {
  const res = await fetch(
    `https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${name}&utf8=&format=json&origin=*`
  );
  const data: SuggestArticle = await res.json();

  // const query_without_referencepages = data?.query ? data.query.search.filter(article => article.size > 3000) : []

  return data?.query?.search ?? [];
};

const [sugestion, setSugestion] = createSignal<Array<Search>>();



export const findArticle = async (name, language: string) => {
  let query = await getWikiPreview(name, language);
  setSugestion(query);
  return query;
};

const SetArticle: Component<{
  lobby: Accessor<any>;
  search: Accessor<Array<Array<string>> | undefined>;
}> = (props) => {
  let timeout: any = null;


  return (
    <>

      <div class="flex justify-center w-full mt-2">
        <div class="flex flex-col flex-wrap" >
          <div class="flex w-full justify-around flex-wrap">

            <input
              class="input input-bordered text-center m-2"
              type="text"
              id="input"
              onkeyup={(e: any) => {
                if (timeout != null) {
                  clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                  findArticle(e.target.value, props.lobby().language);

                  setArticle(e.target.value);
                }, 200);
              }}
              value={article()}
            />
            <Show when={props.lobby().language == 'en'} >
              <RandomArticle
                setter={async (random_article: string) => {
                  findArticle(random_article, props.lobby().language);
                  setArticle(random_article);
                }}
              />
            </Show>
            <Show
              when={
                props.lobby().state === "idle" &&
                props.lobby().articles_to_find.length &&
                props.lobby().start_article
              }
            >
              <div>
                <button
                  class="btn m-2"
                  onclick={() => {
                    setGoToLobby(true);
                  }}
                >
                  <Trans key="setArticle.goToLobby" />
                </button>
              </div>
            </Show>
          </div>
          <Show when={article() !== ""}>
            <ArticleSuggestionsList query={sugestion()} lobby={props.lobby} />
          </Show>
        </div>
      </div >
    </>
  );
};

const ArticleSuggestionsList: Component<{
  query: Accessor<Array<Search>>;
  lobby: TLobby;
}> = (props) => {
  return (
    <For each={props?.query ?? []}>
      {(result, i) => (
        <div class="flex flex-wrap my-2">
          <div class="w-2/3 flex justify-center">
            <div class="flex items-center">
              <span
                class="tooltip tooltip-bottom"
                data-tip={result.snippet.replace(/<[^>]+>/g, "").replaceAll("&quot;", "'") + "..."}
              >
                {" "}
                {result.title}{" "}
              </span>
            </div>
          </div>
          <div class="w-1/3 flex justify-center">
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
                document.getElementById("input")?.focus()
              }}
              class="btn"
            >
              <Trans key="setArticle.select" />
            </button>
          </div>
        </div>
      )}
    </For>
  );
};
export default SetArticle;
