import { Component, createSignal, For, Show } from "solid-js"
import { sendMessage } from "./App"

let [article, setArticle] = createSignal("")
let setArticleMsg = {
  "type": "game", "method": "set_article", "args": {
    "article": "test",
    "start": false,
  }
}

let searchMsg = {
  "type": "search", "method": "execute", "args": {
    "query": ""
  }
}


const SetArticle: Component = (props: any) => {
  return (
    <div class="">
      <input class='input input-bordered' onchange={(e) => {
        let search = searchMsg;
        search.args.query = e.target.value
        sendMessage(search)

        setArticle(e.target.value)
      }} value={article()} />

      <Show when={article() !== ""}>
        <ul>
          <For each={props?.search?.at(3) ?? []}>
            {(result, i) => <li><button onclick={() => {

              let setArticleMsg = {
                "type": "game", "method": "set_article", "args": {
                  "article": result.split("/").pop(),
                  "start": props.lobby.start_article === "",
                }
              }
              sendMessage(setArticleMsg)
              setArticle("")
            }} class='btn'>select</button>{result}</li>}</For>
        </ul>
      </Show>
    </div >)
}

export default SetArticle
