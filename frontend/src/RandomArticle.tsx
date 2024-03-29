import { Component } from "solid-js";
import { Trans, useTransContext } from "@mbarzda/solid-i18next"

import { sendMessage } from "./App";

let getRandomArticleMsg = {
  method: "execute",
  type: "random",
  args: {},
};

let random_articles: string[] = [];
export const addRandomArticles = (articles: string[]) => {
  random_articles = random_articles.concat(articles);
};

const RandomArticle: Component<{ setter: (random_article: string) => void }> = (
  props
) => {
  sendMessage(getRandomArticleMsg);
  return (
    <button
      class="m-2 btn "
      onclick={async () => {
        if (random_articles.length === 5 || random_articles.length === 0) {
          try {
            sendMessage(getRandomArticleMsg);
          } catch (e) {
            alert(e);
          }
        }
        if (random_articles.length !== 0) {
          let article = random_articles.pop();
          if (article) {
            props.setter(article);
          }
        }
      }}
    >
      <Trans key="setArticle.random" />
    </button>

  );
};
export default RandomArticle;
