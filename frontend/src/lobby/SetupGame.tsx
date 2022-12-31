import { Accessor, Component, createSignal, For, Show } from "solid-js";
import { isHost, goToLobby, setGoToLobby } from "./Lobby";
import SetArticle from "./SetArticle";

const SetupGame: Component<{ id: any; lobby: any; search: Accessor<Array<Array<string>> | undefined>; }> = (props) => {
  console.log(props.lobby().players)
  return (
    <>
      <Show
        when={
          props.lobby().state === "idle" &&
          !props.lobby().start_article &&
          isHost(props)
        }
      >
        <div class="flex justify-center font-bold">
          Search for a page to start:
        </div>
        <SetArticle lobby={props.lobby} search={props.search} />
      </Show>
      <Show
        when={
          props.lobby().state === "idle" &&
          props.lobby().start_article &&
          !goToLobby() &&
          isHost(props)
        }
      >
        <div class="flex justify-center font-bold">
          Search for a page or pages to find:
        </div>
        <SetArticle lobby={props.lobby} search={props.search} />
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
