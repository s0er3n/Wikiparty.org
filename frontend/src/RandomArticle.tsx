const RandomArticle: Component<{ setter: (random_article: string) => void }> = (
  props
) => {
  let random_articles = [];
  return (
    <button
      class="btn"
      onclick={async () => {
        if (random_articles.length === 0) {
          let data = await fetch(
            "https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=100&origin=*"
          );
          data = await data.json();
          random_articles = data.query.random.map((e) => e.title);
        }
        props.setter(random_articles.pop());
      }}
    >
      get random article name
    </button>
  );
};
export default RandomArticle;
