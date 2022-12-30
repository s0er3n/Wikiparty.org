import { For, Component, createEffect, Show } from "solid-js";
import { createSignal } from "solid-js";
import { v4 as uuidv4 } from "uuid";
import GameOver from "./GameOver";
import Header from "./Header";
import JoinOrCreateLobby from "./JoinOrCreateLobby";
import SetArticle from "./SetArticle";
import SetTime from "./SetTime";
import SetUserName from "./SetUserName";
import Lobby from "./Lobby";
import "./wiki.css";

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
    // joining lobby if you were in a lobby before
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (urlSearchParams.get("code")) {
      let joinLobbyMsg = {
        type: "lobby",
        method: "join_lobby",
        args: { id: urlSearchParams.get("code") },
      };
      sendMessage(joinLobbyMsg);
    }
  };

  ws.onclose = (e) => {
    setLobby(undefined);
    setConnection(false);
  };
  ws.onmessage = (e) => {
    let data = JSON.parse(e.data);

    if (data.method === "LobbyUpdate") {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("code", data.id);
      window.history.pushState(null, "", "?" + urlParams.toString());

      console.log(data);
      if (data?.state == "over") {
        setGoToLobby(false);
      }
      setLobby(data);
    } else if (data.method === "Wiki" && !Array.isArray(data.data)) {
      setWiki(data.data);
      console.log(data);
      // search -> maybe add a method on backend
    } else if (typeof data.data === "object") {
      console.log(data.data);
      if (!data.data.error) {
        setSearch(data.data);
      }
    } else {
      console.log(e);
    }
  };
}

let [lobby, setLobby] = createSignal<any>(undefined);

startWS();

// export const isHost = () => {
//   // TODO: this is assuming the host is always the first player
//   // check for player rights
//   return lobby().players[0][0].id == id;
// };

const App: Component = () => {
  // derived state if player is host

  return (
    <div>
      <Header lobby={lobby} id={id} />

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
            <Lobby ws={ws} wiki={wiki} id={id} lobby={lobby} setGoToLobby={setGoToLobby} goToLobby={goToLobby} search={search} />
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


export default App;
