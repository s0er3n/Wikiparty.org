import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";
import SetArticle from "./SetArticle";

const SetArticleHeadline: Component<{ lobby: any }> = (props) => {
  return (
    <div class="flex justify-center font-bold">
      <Show
        when={
          props.lobby().start_article
        }
        fallback={
          <div>
            Search for a page to start:
          </div>
        }
      >
        <div >
          Search for a page or pages to find:
        </div>
      </Show>
    </div>
  )
}

const SetupGame: Component<{ id: any; lobby: any; search: Accessor<Array<Array<string>> | undefined>; }> = (props) => {
  return (
    <>
      <SetArticleHeadline lobby={props.lobby} />
      <SetArticle lobby={props.lobby} search={props.search} />
      <Show
        when={
          props.lobby().start_article
        }
      >
        <Show
          when={
            props.lobby().state === "idle" &&
            props.lobby().articles_to_find.length &&
            isHost(props)
          }
        >
          <div class="flex justify-center">
            <button
              class="btn m-2"
              onclick={() => {
                setGoToLobby(true);
              }}
            >
              go to lobby
            </button>
          </div>
        </Show>
      </Show>
    </>
  )
};

export default SetupGame;
