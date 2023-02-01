import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";

import {
  Html, Head, Title, Meta, Link, Body, Routes, FileRoutes, Scripts, ErrorBoundary
} from "solid-start";

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
    for (const element of document.getElementsByClassName("collapsible-block")) {
      element.hidden = true
    }
    for (const element of document.getElementsByClassName("mw-editsection")) {
      element.hidden = true
    }
    for (const element of document.getElementsByClassName("lazy-image-placeholder")) {
      console.log(element)
      let image_el = document.createElement('img');
      for (const attr of element.attributes) {
        if (attr.name == "data-src") {
          image_el.setAttribute("src", attr.value)
          continue
        }
        image_el.setAttribute(attr.name, attr.value)
      }
      console.log(image_el)
      element.replaceWith(image_el)
    }

    window.scrollTo({ top: 0 });
  });
};

const [show, setShow] = createSignal(true);
const Wiki: Component<{ lobby: Accessor<TLobby> }> = (props) => {
  let current_position = props?.lobby()?.players?.find((player) => {
    return player[0].id === id;
  })[1]?.current_position;
  updateWiki(current_position);

  // let intervall = setInterval(() => {
  //   setShow(document.hasFocus());
  // }, 100);
  onCleanup(() => {
    clearInterval(intervall);
  });
  console.log(screen.width > 480)

  const script = document.createElement("script");
  script.src = "../../public/MobileJS.js";
  script.async = true;
  document.body.appendChild(script);

  return (
    <div>
      <script>{"function mfTempOpenSection(number){let el = document.getElementById('mf-section-'+number); console.log(el)}"} </script>
      <WikiProvider />
      <Portal useShadow={false} mount={container()}>
        <Show when={show()} fallback={<div>CLICK TO SHOW WIKIPEDIA</div>}>
          <div align="left">
            <Show when={screen.width <= 480} fallback={<link rel="stylesheet" type="text/css" href="Wiki.css" />}>
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
          </div>
        </Show >
      </Portal >
    </div >
  );
};

export default Wiki;
