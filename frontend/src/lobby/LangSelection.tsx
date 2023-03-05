import { Component, createSignal, For } from "solid-js";
import { sendMessage } from "./../App"


const SetLang: Component<any> = (props) => {

  const languages = { "english": "en", "deutsch": "de", "francais": "fr", "Русский": "ru", "español": "es" }

  return (
    <>
      <select value={props.lobby().language} class="select select-bordered" onchange={(e) => {
        sendMessage({
          type: "game",
          method: "set_language",
          args: {
            language: e.target.value,
          },
        })
      }
      }
      >
        <For each={Object.entries(languages)}>
          {(entry) => {
            return <option value={entry[1]
            }>{entry[0]}</option>
          }
          }</For>
      </select>
    </>
  )
}

export default SetLang
