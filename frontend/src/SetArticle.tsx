import { Component, createSignal, Show } from "solid-js"
import { sendMessage } from "./App"

let [article, setArticle] = createSignal("")
let setArticleMsg = {
  "type": "game", "method": "set_article", "args": {
    "article": "test",
    "start": false,
  }
}

const SetArticle: Component = (props: any) => {
  return (
    <div class="input-group">
      <input class='input input-bordered' onchange={(e) => setArticle(e.target.value)} value={article()} />
      <Show when={props.lobby.start_article !== ""}>
        <button class='btn' onclick={
          () => {
            let msg: any = setArticleMsg
            msg.args.article = article()
            msg.args.start = false
            sendMessage(setArticleMsg)
            setArticle("")
          }
        }>set article to find</button>
      </Show>

      <Show when={props.lobby.start_article === ""}>
        <button class='btn' onclick={
          () => {
            let msg: any = setArticleMsg
            msg.args.article = article()
            msg.args.start = true
            sendMessage(setArticleMsg)
            setArticle("")
          }

        }>set start article</button>
      </Show>
    </div >)
}

export default SetArticle
