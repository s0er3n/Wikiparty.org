import { For, Component, createEffect, Show } from "solid-js";
import { createSignal } from "solid-js";

import Header from "./lobby/Header";
import JoinOrCreateLobby from "./JoinOrCreateLobby";
import SetUsername from "./SetUsername";
import Lobby, { setGoToLobby } from "./lobby/Lobby";
import { TLobby, TWiki, TPlayer } from "./types";
import { addRandomArticles } from "./RandomArticle";

import PlayerList from "./lobby/PlayerList";
import { updateWiki } from "./lobby/Wiki";

let [connected, setConnection] = createSignal<boolean>(false);
let [hasUsername, setHasUsername] = createSignal<boolean>(false);
let ws: WebSocket | null = null;

let missedMessages: string[] = [];
export function sendMessage(msg: any) {
  if (ws) {
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
      try {
        ws?.close()
      } catch {
        console.log("websocket already in closed state")
      }
      missedMessages.push(JSON.stringify(msg));
    }
  } else {
    missedMessages.push(JSON.stringify(msg));
    console.warn("websocket not connected");
  }
}

// let [players, setPlayers = createSignal([])

let id = localStorage.getItem("id");
let password = localStorage.getItem("private_key");
let [wiki, setWiki] = createSignal<TWiki>();

let setUsernameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: "Gast" },
};

if (!id) {
  id = self.crypto.randomUUID();
  localStorage.setItem("id", id);
}

if (!password) {
  password = self.crypto.randomUUID();
  localStorage.setItem("private_key", password);
}

const [search, setSearch] = createSignal([]);

export const startWS = () => {
  ws = new WebSocket(`${import.meta.env.VITE_backend_url}/ws/${id}`);

  ws.onopen = (_) => {
    ws?.send(password)
    setConnection(true);
    let username = localStorage.getItem("username");
    if (username) {
      let msg = setUsernameMsg;
      setUsernameMsg.args.name = username;
      sendMessage(msg);
      setHasUsername(true);
    }
    // joining lobby if you were in a lobby before
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (urlSearchParams.get("code")) {
      let joinLobbyMsg = {
        type: "lobby",
        method: "join_lobby",
        args: { id: urlSearchParams.get("code")},
      };
      sendMessage(joinLobbyMsg);
    }
    missedMessages.forEach((msg) => {
      ws?.send(msg);
    });
    missedMessages = [];
  };
  ws.onerror = function(err) {
    console.error("Socket encountered error: ", err, "Closing socket");
    ws?.close();
  };
  ws.onclose = function(e) {
    console.log(
      "Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setConnection(false);
    setTimeout(function() {
      startWS();
    }, 1000);
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
      setPlayers(data.players);
      setLobby(data);
    } else if (data.method === "Wiki" && !Array.isArray(data.data)) {
      setWiki(data.data);
      window.scrollTo(0, 0);
      console.log(data);
      // search -> maybe add a method on backend
    } else if (data.method === "Random") {
      addRandomArticles(data.data);
    } else if (data.method === "LobbyNotFound") {
      setLobby(null);
    } else if (data.method === "SyncMove") {
      updateWiki(data.url_name);
    } else if (typeof data.data === "object") {
      console.log(data.data);
      if (!data.data.error) {
        setSearch(data.data);
      }
    } else {
      console.log(e);
    }
  };
};

const [lobby, setLobby] = createSignal<TLobby | null>(null);
const [players, setPlayers] = createSignal<TPlayer[] | null>(null);


const [code, setCode] = createSignal<bool>(false);

if (localStorage.getItem("username")) {
  startWS();
}

const App: Component = () => {
  // derived state if player is host

  return (
    <div class="flex items-stretch min-h-screen bg-base-200">
      <Show when={lobby()?.state === "ingame"}>
        <div class="hidden lg:flex">
          <aside class="p-3 grow flex flex-col justify-start max-h-screen w-48 m-3 mr-0 bg-base-100 shadow-md rounded-md sticky top-3">
            <div class="font-bold mb-3">
              <h3>Players</h3>
            </div>
            <PlayerList
              players={players}
              pointsKey="points_current_round"
            />
          </aside>
        </div>
      </Show>
      <div class="w-full">
        <Show when={lobby() && hasUsername()}>
          <Header lobby={lobby} id={id} />
        </Show>

        <Show when={lobby()}>
          <Lobby players={players} wiki={wiki} id={id} lobby={lobby} search={search} />
        </Show>
        <Show when={!lobby()}>
          <div class="flex flex-col items-center">
            <div
              class="hero min-h-screen bg-base-200 object-cover"
              style="background-image: url(triangles-download (1).png);"
            >
              <div class="hero-content text-center flex flex-col">
                <div class="max-w-xl">
                  <h1 class="text-5xl font-bold">Welcome to WikiParty</h1>
                  <p class="py-6">
                    A game that will take you on a journey through the world of
                    Wikipedia!
                  </p>
                </div>
                <Show when={!hasUsername()}>
                  <SetUsername setHasUsername={setHasUsername} />
                </Show>
                <Show when={hasUsername()}>
                  <Show when={!lobby() && hasUsername()}>
                    <JoinOrCreateLobby />
                  </Show>
                </Show>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default App;
