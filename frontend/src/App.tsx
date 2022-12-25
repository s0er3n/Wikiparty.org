import { For, Component, createEffect, Show } from "solid-js";
import { createSignal } from "solid-js";
import { v4 as uuidv4 } from "uuid";
import GameOver from "./GameOver";
import Header from "./Header";
import JoinOrCreateLobby from "./JoinOrCreateLobby";
import SetArticle from "./SetArticle";
import SetTime from "./SetTime";
import SetUserName from "./SetUserName";

let [connected, setConnection] = createSignal<boolean>(false);
let [hasUserName, setHasUserName] = createSignal<boolean>(false);
let ws: WebSocket | null = null;

export function sendMessage(msg: any) {
  if (ws) {
    ws.send(JSON.stringify(msg));
  } else {
    console.warn("websocket not connected");
  }
}

let startGameMsg = { type: "game", method: "start", args: {} };

// let [players, setPlayers = createSignal([])

let [wiki, setWiki] = createSignal<{ title: string; text: { "*": string } }>();
let id = localStorage.getItem("id");

let setUserNameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: "Gast" },
};

if (!id) {
  id = uuidv4() as string;
  localStorage.setItem("id", id);
}

const [search, setSearch] = createSignal([]);

function startWS() {
  ws = new WebSocket(`${import.meta.env.VITE_backend_url}/ws/${id}`);

  ws.onopen = (_) => {
    setConnection(true);
    let username = localStorage.getItem("username");
    if (username) {
      let msg = setUserNameMsg;
      setUserNameMsg.args.name = username;
      sendMessage(msg);
      setHasUserName(true);
    }
  };
  ws.onmessage = (e) => {
    let data = JSON.parse(e.data);

    if (data.id) {
      console.log(data);
      if (data?.state == "over") {
        setGoToLobby(false);
      }
      setLobby(data);
    } else if (data?.data?.text) {
      setWiki(data.data);
      console.log(data);
    } else if (typeof data.data === "object") {
      console.log(data.data);
      setSearch(data.data);
    } else {
      console.log(e);
    }
  };
}

let [lobby, setLobby] = createSignal<any>(undefined);

startWS();

export const isHost = () => {
  // TODO: this is assuming the host is always the first player
  // check for player rights
  return lobby().players[0][0].id == id;
};
const App: Component = () => {
  // derived state if player is host

  return (
    <div>
      <Header lobby={lobby} />

      <div class="sticky mt-32 sticky bottom-0">
        <Show
          when={connected()}
          fallback={
            <button
              class="w-96"
              onclick={() => {
                startWS();
              }}
            >
              start ws connection
            </button>
          }
        >
          <Show when={!hasUserName() && !lobby()}>
            <SetUserName setHasUserName={setHasUserName} />
          </Show>
          <Show when={lobby()}>
            <Lobby />
            is host: {JSON.stringify(isHost())}
          </Show>
          <Show when={!lobby() && hasUserName()}>
            <JoinOrCreateLobby />
          </Show>
        </Show>
      </div>
    </div>
  );
};

const [goToLobby, setGoToLobby] = createSignal(false);
const Lobby: Component = () => {
  const player = () => lobby().players.find((player) => player[0].id === id);

  return (
    <>
      <Show
        when={lobby().state === "idle" && !lobby().start_article && isHost()}
      >
        <div class="flex justify-center font-bold">
          Search for a page to start:
        </div>
        <SetArticle lobby={lobby} search={search} />
      </Show>
      <Show
        when={
          lobby().state === "idle" &&
          lobby().start_article &&
          !goToLobby() &&
          isHost()
        }
      >
        <div class="flex justify-center font-bold">
          Search for a page or pages to find:
        </div>
        <SetArticle lobby={lobby} search={search} />
        <Show
          when={
            lobby().state === "idle" &&
            lobby().articles_to_find.length &&
            isHost()
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
          k
        </Show>
      </Show>
      <Show
        when={
          (lobby().state === "idle" && lobby().start_article && goToLobby()) ||
          (!isHost() && lobby().state === "idle")
        }
      >
        <div class="flex justify-center">
          <div>
            <PlayerList />
            <SetTime time={lobby().time} />
            <Show when={isHost()}>
              <button
                class="btn"
                onclick={() => {
                  sendMessage(startGameMsg);
                }}
              >
                start game
              </button>
            </Show>
          </div>
        </div>
      </Show>
      <Show when={lobby().state === "ingame"}>
        <>
          <Wiki />
        </>
        <div class="font-bold sticky bottom-0 bg-gray-500 z-50">
          <div>Your Name: {player()[0].name}</div>
          <div> Your Points: {player()[0].points}</div>
          Find these Articles:{" "}
          {lobby()
            .articles_to_find.filter((article) => {
              return !player()[1]
                .moves.map((move) => move.pretty_name)
                .includes(article);
            })
            .join(" | ")}
        </div>
      </Show>

      <Show when={lobby().state === "over"}>
        <GameOver players={lobby().players} />
      </Show>
    </>
  );
};

const Wiki: Component = () => {
  return (
    <div class="flex justify-center mt-24">
      <div>
        <div class="text-xl font-bold">{wiki()?.title ?? ""}</div>
        <div class="flex justify-center mt-24" style={"all: revert"}>
          <div
            class="prose prose-lg"
            onclick={async (e) => {
              let targetValue = e.target.getAttribute("href");
              if (targetValue?.includes("wiki")) {
                e.preventDefault();
                let response = await fetch(
                  `https://wikipediaquery-production.up.railway.app/article/${targetValue
                    .split("/")
                    .pop()}`
                );

                response = await response.json();
                let moveMsg = {
                  type: "game",
                  method: "move",
                  args: {
                    url_name: targetValue.split("/").pop(),
                    pretty_name: response.title,
                  },
                };
                let wiki = {
                  text: { "*": response.content_html },
                  title: response.title,
                };

                setWiki(wiki);
                window.scrollTo(0, 0);
                sendMessage(moveMsg);
              }
            }}
            innerHTML={wiki()?.text?.["*"].replace("[edit]", "") ?? ""}
          />
        </div>
      </div>
    </div>
  );
};

const PlayerList: Component = () => {
  return (
    <ul>
      <For each={lobby()?.players ?? []}>
        {(player: any, i) => (
          <li>
            <span class="font-bold">{player[0].name}</span>
            <span class="ml-2">{JSON.stringify(player[0].points ?? 0)}</span>
          </li>
        )}
      </For>
    </ul>
  );
};

export default App;
