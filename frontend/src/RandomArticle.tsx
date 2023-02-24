import { Component } from "solid-js";
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
      class="btn w-full"
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
      random
    </button>
  );
};
export default RandomArticle;
