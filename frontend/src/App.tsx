import { For, Component, createEffect, Show } from "solid-js";
import { createSignal } from "solid-js";

import Header from "./lobby/Header";
import JoinOrCreateLobby from "./JoinOrCreateLobby";
import SetUserName from "./SetUserName";
import Lobby, { setGoToLobby } from "./lobby/Lobby";
import { TLobby, TWiki } from "./types";
import { addRandomArticles } from "./RandomArticle";

import PlayerList from "./lobby/PlayerList";
import { forceUpdate } from "./lobby/Wiki";

let [connected, setConnection] = createSignal<boolean>(false);
let [hasUserName, setHasUserName] = createSignal<boolean>(false);
let ws: WebSocket | null = null;

let missedMessages: string[] = [];
export function sendMessage(msg: any) {
  if (ws) {
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
      missedMessages.push(JSON.stringify(msg));
    }
  } else {
    missedMessages.push(JSON.stringify(msg));
    console.warn("websocket not connected");
  }
}

// let [players, setPlayers = createSignal([])

let id = localStorage.getItem("id");
let [wiki, setWiki] = createSignal<TWiki>();

let setUserNameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: "Gast" },
};

if (!id) {
  id = self.crypto.randomUUID();
  localStorage.setItem("id", id);
}

const [search, setSearch] = createSignal([]);

export const startWS = () => {
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
      forceUpdate(data.url_name);
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

let [lobby, setLobby] = createSignal<TLobby | null>(null);

let [code, setCode] = createSignal<bool>(false);

if (localStorage.getItem("username")) {
  startWS();
}

const App: Component = () => {
  // derived state if player is host

  if (code() || !localStorage.getItem("pre-alpha"))
    return (
      <>
        <div class="flex flex-col justify-center h-screen items-center">
          <div class="text-xl font-light">Enter Your Code:</div>
          <div class="flex space-x-2">
            <input
              onchange={(e) => {
                if (e.target.value === "pre-alpha") {
                  setCode(true);
                  localStorage.setItem("pre-alpha", crypto.randomUUID());
                }
              }}
              type="text"
              placeholder="Code"
              class="input input-bordered"
            />
            <button
              onclick={() => {
                if (code()) {
                  window.location.reload();
                }
              }}
              class="btn"
            >
              Join Now
            </button>
          </div>
        </div>
      </>
    );
  return (
    <div class="flex items-stretch min-h-screen">
      <Show when={lobby()?.state === "ingame"}>
        <aside class="p-3 grow flex flex-col justify-start max-h-screen w-48 m-3 mr-0 bg-base-100 shadow-md rounded-md sticky top-3">
          <div class="font-bold mb-3">
            <h3>Players</h3>
          </div>
          <PlayerList
            players={lobby()?.players}
            pointsKey="points_current_round"
          />
        </aside>
      </Show>
      <div style="width: 100%">
        <Header lobby={lobby} id={id} />

        <div class="flex justify-center">
          <Show when={!hasUserName()}>
            <SetUserName setHasUserName={setHasUserName} />
          </Show>
          <Show when={hasUserName()}>
            <Show when={connected()} fallback={<>connecting...</>}></Show>
            <div>
              <Show when={lobby()}>
                <Lobby wiki={wiki} id={id} lobby={lobby} search={search} />
              </Show>
              <Show when={!lobby() && hasUserName()}>
                <JoinOrCreateLobby />
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default App;
