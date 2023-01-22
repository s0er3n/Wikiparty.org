import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";

import { sendMessage } from "./../App";

import { Portal } from "solid-js/web";
import { TLobby } from "../types";

const [container, setContainer] = createSignal<HTMLDivElement>();
const WikiProvider = () => {
  return <div class="m-3 " ref={setContainer} id="modal" />;
};

export interface WikiRes {
  parse: Parse;
}

export interface Parse {
  title: string;
  pageid: number;
  redirects: any[];
  text: Text;
}

export interface Text {
  "*": string;
}

const getWiki = async (name: string) => {
  const res = await fetch(
    `https://wiki.soeren-michaels.workers.dev/wiki/${name}`
  );
  const data: WikiRes = await res.json();
  return {
    html: data.parse.text["*"],
    title: data.parse.title,
    url_name: name,
  };
};

const [currentWiki, setCurrentWiki] = createSignal<{
  title: string;
  html: string;
  url_name: string;
}>({ title: "", html: "", url_name: "" });

let id = localStorage.getItem("id");

export const updateWiki = (url: string) => {
  getWiki(url).then((res) => {
    setCurrentWiki(res);

    window.scrollTo({ top: 0 });
  });
};

const [show, setShow] = createSignal(false);
const Wiki: Component<{ lobby: Accessor<TLobby> }> = (props) => {
  let current_position = props?.lobby()?.players?.find((player) => {
    return player[0].id === id;
  })[1]?.current_position;
  updateWiki(current_position);

  let intervall = setInterval(() => {
    setShow(document.hasFocus());
  }, 100);
  onCleanup(() => {
    clearInterval(intervall);
  });

  return (
    <div>
      <WikiProvider />
      <Portal useShadow={false} mount={container()}>
        <Show when={show()} fallback={<div>CLICK TO SHOW WIKIPEDIA</div>}>
          <div align="left">
            <link rel="stylesheet" type="text/css" href="wiki.css" />
            <h1>{currentWiki().title}</h1>
            <div
              class="w-fit overflow-y"
              onclick={async (e: any) => {
                let targetValue: string;
                if (!e.target.getAttribute("href")) {
                  targetValue = e
                    ?.composedPath()
                    ?.find((event) => {
                      return event?.getAttribute("href") !== null;
                    })
                    ?.getAttribute("href");

                  if (!targetValue) {
                    return;
                  }
                } else {
                  targetValue = e.target.getAttribute("href");
                }
                console.log(targetValue);

                e.preventDefault();

                if (targetValue.startsWith("#")) {
                  var offsetHeight =
                    document.getElementById("header")?.scrollHeight ?? 0;
                  console.log(offsetHeight);
                  const element = e.target
                    .getRootNode()
                    .getElementById(targetValue.slice(1));
                  const y =
                    element.getBoundingClientRect().top +
                    window.pageYOffset -
                    offsetHeight;

                  window.scrollTo({ top: y });
                }

                if (
                  targetValue.startsWith("http") ||
                  targetValue.includes(":")
                ) {
                  return;
                }
                if (
                  targetValue?.includes("wiki") &&
                  !targetValue?.includes("wiki/Help") &&
                  !targetValue?.includes("wiki/File")
                ) {
                  let url_name = targetValue?.split("wiki/").pop();
                  url_name = url_name?.split("#")[0];
                  let moveMsg = {
                    type: "game",
                    method: "move",
                    args: {
                      url_name,
                    },
                  };

                  sendMessage(moveMsg);
                  updateWiki(url_name);
                }
              }}
              innerHTML={currentWiki().html}
            />
          </div>
        </Show>
      </Portal>
    </div>
  );
};

export default Wiki;
