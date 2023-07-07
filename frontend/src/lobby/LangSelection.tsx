import { Component, createSignal, For, onMount } from "solid-js";
import { sendMessage } from "./../App"
import { findArticle } from "./SetArticle";

import { Trans, useTransContext } from "@mbarzda/solid-i18next"

const SetLang: Component<any> = (props) => {

  const languages = { "english": "en", "deutsch": "de", "francais": "fr", "korean (한국인)": "ko", "Русский": "ru", "Türkçe": "tr" ,  "español": "es", "slovenščina": "sl", 'українська': 'uk', 'nederlands': 'nl', 'português': 'pt' }

  const [, { changeLanguage }] = useTransContext();
  onMount(() =>{
    let lng;
    if (!localStorage.getItem("lng")) {
      lng = navigator.language.split("-")[0]

      if (!Object.values(languages).includes(lng)) {
        console.log(Object.keys(languages))
        lng = "en"
      }
    } else {
      lng = localStorage.getItem("lng")
    }
    console.log(lng)
    
    if (lng !== "en") {
      sendMessage({
        type: "game",
        method: "set_language",
        args: {
          language: lng,
        },
      })
    }
    findArticle('', lng)
  })

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

        let lng = e.target.value;
        changeLanguage(lng)
        localStorage.setItem("lng", lng)
        findArticle('', e.target.value)
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
