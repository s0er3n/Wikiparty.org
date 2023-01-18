import { Accessor, Component, createEffect, createSignal } from "solid-js";
import { sendMessage } from "./../App";

import { Portal } from "solid-js/web";
import { TLobby } from "../types";

const [container, setContainer] = createSignal<HTMLDivElement>();
const WikiProvider = () => {
  return <div class="m-3" ref={setContainer} id="modal" />;
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

let clicked = false;
let currTimeout: number;
const getWiki = async (name: string) => {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${name}&format=json&disableeditsection=1&redirects=true&useskin=minerva&origin=*`
  );
  const data: WikiRes = await res.json();
  if (currTimeout) {
    clearTimeout(currTimeout);
  }
  currTimeout = setTimeout(() => {
    // giving server time to update
    clicked = false;
  }, 700);
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

export const forceUpdate = (url: string) => {
  getWiki(url).then((res) => {
    setCurrentWiki(res);
  });
};
const Wiki: Component<{ lobby: Accessor<TLobby> }> = (props) => {
  let current_position = props?.lobby()?.players?.find((player) => {
    return player[0].id === id;
  })[1]?.current_position;
  getWiki(current_position).then((res) => {
    setCurrentWiki(res);
  });
  return (
    <div>
      <WikiProvider />
      <Portal useShadow={false} mount={container()}>
        <div align="left">
          <link rel="stylesheet" type="text/css" href="wiki.css" />
          <h1>{currentWiki().title}</h1>
          <div
            onclick={async (e: any) => {
              let targetValue: string;
              if (!e.target.getAttribute("href")) {
                targetValue = e?.path
                  ?.find((element) => {
                    return element?.getAttribute("href") !== null;
                  })
                  ?.getAttribute("href");

                if (!targetValue) {
                  return;
                }
              } else {
                targetValue = e.target.getAttribute("href");
              }

              console.log(targetValue);
              if (targetValue.startsWith("#")) {
                const yOffset = -218;
                const element = e.target
                  .getRootNode()
                  .getElementById(targetValue.slice(1));
                console.log(element);
                const y =
                  element.getBoundingClientRect().top +
                  window.pageYOffset +
                  yOffset;

                window.scrollTo({ top: y });
              }
              e.preventDefault();

              if (targetValue.startsWith("http") || targetValue.includes(":")) {
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
                getWiki(url_name).then((res) => {
                  setCurrentWiki(res);
                  clicked = true;
                });
              }
            }}
            innerHTML={currentWiki().html}
          />
        </div>
      </Portal>
    </div>
  );
};

export default Wiki;
