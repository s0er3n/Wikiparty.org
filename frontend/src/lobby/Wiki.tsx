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

function fixMobileView() {
  for (const collapsible_section of document.getElementsByClassName("collapsible-block")) {
    collapsible_section.hidden = true
  }
  for (const edit_button of document.getElementsByClassName("mw-editsection")) {
    edit_button.hidden = true
  }
  for (const unloaded_img of document.getElementsByClassName("lazy-image-placeholder")) {
    let image = document.createElement('img');
    for (const attr of unloaded_img.attributes) {
      if (attr.name == "data-src") {
        image.setAttribute("src", attr.value)
        continue
      }
      image.setAttribute(attr.name, attr.value)
    }
    unloaded_img.replaceWith(image)
  }

}

export const updateWiki = async (url: string) => {
  let res = await getWiki(url)
  setCurrentWiki(res);
  fixMobileView()
  window.scrollTo({ top: 0 });
};

const [show, setShow] = createSignal(false);
const Wiki: Component<{ lobby: Accessor<TLobby> }> = (props) => {
  let current_position = props?.lobby()?.players?.find((player) => {
    return player[0].id === id;
  })[1]?.current_position;
  updateWiki(current_position);

  if (import.meta.env.DEV) {
    setShow(true)
  }

  if (import.meta.env.PROD) {
    let intervall = setInterval(() => {
      setShow(document.hasFocus());
    }, 100);
    onCleanup(() => {
      clearInterval(intervall);
    });

    createEffect(() => {
      if (show()) {
        fixMobileView()
      }
    })
  }

  return (
    <div>
      <WikiProvider />
      <Portal useShadow={false} mount={container()}>
        <Show when={show()} fallback={<div>CLICK TO SHOW WIKIPEDIA</div>}>
          <div align="left">
            <Show when={screen.width < 640} fallback={<link rel="stylesheet" type="text/css" href="Wiki.css" />}>
              <link rel="stylesheet" type="text/css" href="mobileWiki.css" />
            </Show>
            <h1>{currentWiki().title}</h1>
            <div id="bodyContent" class="content">
              <div
                id="mw-content-text" class="mw-body-content mw-content-ltr" dir="ltr" lang="en"
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
                    !targetValue?.includes("wiki/File") &&
                    !targetValue?.split("wiki/").pop()?.includes("/")

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

                    // awaiting it here so that the sync move happens after you click and not before
                    await updateWiki(url_name);
                    sendMessage(moveMsg);
                  }
                }}
                innerHTML={currentWiki().html}
              />
            </div>
          </div>
        </Show >
      </Portal >
    </div >
  );
};

export default Wiki;
