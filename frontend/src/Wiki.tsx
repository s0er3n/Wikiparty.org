import { Component } from "solid-js";
import { sendMessage } from "./App";

const Wiki: Component<{ wiki: any }> = (props) => {
  return (
    <div class="flex justify-center mt-24">
      <div class="p-10">
        <div class="text-3xl font-bold">{props.wiki()?.title ?? ""}</div>
        <div class="flex justify-center mt-24" style={"all: revert"}>
          <div
            onclick={async (e) => {
              let targetValue = e.target.getAttribute("href");
              if (
                targetValue?.includes("wiki") &&
                !targetValue?.includes("wiki/Help") &&
                !targetValue?.includes("wiki/File")
              ) {
                e.preventDefault();
              } else if (
                targetValue?.includes("http") ||
                targetValue?.includes("wiki")
              ) {
                e.preventDefault();
                return;
              }

              let moveMsg = {
                type: "game",
                method: "move",
                args: {
                  url_name: targetValue?.split("wiki/").pop(),
                  // pretty_name: response.title,
                },
              };
              window.scrollTo(0, 0);
              sendMessage(moveMsg);
            }}
            innerHTML={props.wiki()?.content_html ?? ""}
          />
        </div>
      </div>
    </div>
  );
};

export default Wiki;
