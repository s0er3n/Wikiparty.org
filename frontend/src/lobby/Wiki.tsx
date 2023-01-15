import { Component, createSignal } from "solid-js";
import { sendMessage } from "./../App";

import { Portal } from "solid-js/web";

const [container, setContainer] = createSignal<HTMLDivElement>();
const WikiProvider = () => {
  return <div class="m-3" ref={setContainer} id="modal" />;
};

const Wiki: Component<{ wiki: any }> = (props) => {
  return (
    <div>
      <WikiProvider />
      <Portal useShadow={true} mount={container()}>
        <div align="left">
          <link rel="stylesheet" type="text/css" href="wiki.css" />
          <h1>{props.wiki()?.title ?? ""}</h1>
          <div
            onclick={async (e: any) => {
              let targetValue;
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

              if (!targetValue.startsWith("#")) {
                e.preventDefault();
              }
              if (
                targetValue?.includes("wiki") &&
                !targetValue?.includes("wiki/Help") &&
                !targetValue?.includes("wiki/File")
              ) {
                let moveMsg = {
                  type: "game",
                  method: "move",
                  args: {
                    url_name: targetValue?.split("wiki/").pop(),
                  },
                };
                sendMessage(moveMsg);
              } else if (
                targetValue?.includes("http") ||
                targetValue?.includes("wiki")
              ) {
                return;
              }
            }}
            innerHTML={props.wiki()?.content_html ?? ""}
          />
        </div>
      </Portal>
    </div>
  );
};

export default Wiki;
