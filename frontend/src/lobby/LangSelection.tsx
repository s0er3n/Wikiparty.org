import { Component, createSignal, For } from "solid-js";
import { sendMessage } from "./../App"

const [lang, setLang] = createSignal<string>("en")

const SetLang: Component<{}> = () => {

  const lang_dict = { "englisch": "en", "deutsch": "de", "francaise": "fr", "blyat": "ru", "espaniol": "es" }

  return (
    <div>
      <div class="form-control" >
        <select class="select w-full max-w-xs" onchange={(e) => {
          sendMessage({
            type: "game",
            method: "set_language",
            args: {
              lang: e.target.value,
            },
          })
            , setLang(e.target.value)
        }
        }
        >
          <For each={lang_dict}>{(key, value) =>
            <option selected={props.lobby().language === key} value={value}>{key}</option>
          }</For>
        </select>
      </div>
    </div >
  )
}

export default SetLang
