import { Component } from "solid-js";
import { sendMessage } from "./../App";
import "./../wiki.css";

const Wiki: Component<{ wiki: any }> = (props) => {
  return (
    <div align="left">
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
  );
};

export default Wiki;
