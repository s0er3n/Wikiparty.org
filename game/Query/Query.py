from game.settings.logsetup import logger
from typing import Iterator
import json
import requests
from bs4 import BeautifulSoup
import urllib.parse

from game.Player.Player import Player

from game.settings import db


def _select_and_reduce_links(all_links) -> Iterator[str]:
    for link in all_links:
        if link["href"].startswith("/wiki/") and not link["href"].startswith("/wiki/Help") and not link["href"].startswith("/wiki/File"):
            yield link["href"][6::].split("#")[0]


class Query:

    @classmethod
    def query_and_add_to_queries(cls, move: str, language: str) -> str | None:
        logger.warning(f"add move to query {move}")
        resp = requests.get(
            f"https://{language}.wikipedia.org/wiki/{urllib.parse.quote_plus(move) if '%' not in move  else move}"
        )
        resp_text = resp.text

        if resp.history:
            move = resp.history[-1].url

        soup = BeautifulSoup(resp_text, "lxml")

        if not (h1 := soup.find("h1")):
            logger.warning("no h1 in wikipedia response")
            return None
        title = h1.text

        article = soup.find("div", {"id": "mw-content-text"})

        # data = _skip_if_redirect(data)

        all_links = soup.find_all("a", href=True)

        short_links = list(_select_and_reduce_links(all_links))

        db.client.set(f"article:{language}:" + move, json.dumps({"links": short_links,
                                                                 "title": str(title),
                                                                 "url_ending": move}), ex=60 * 60 * 24)
        return move

    @classmethod
    def execute(cls, move: str, language: str, recipient: Player) -> str | None:
        if not db.get_article(move, language):
            try:
                move = cls.query_and_add_to_queries(move, language)
                assert move is not None
            except:
                logger.error("could not query wikipedia")
                return

        if not (query_result := db.get_article(move, language)):
            logger.warning("no query result")
            return None
        query_result = json.loads(query_result)
        db.client.hincrby("count", move)
        return query_result["title"]

    @classmethod
    def is_link_allowed(cls, current_location, url_name, language: str) -> bool:
        url_name = url_name.split("#")[0]
        redis_result = db.get_article(current_location, language)
        if not redis_result:
            # requerying current location in case it was not in redis
            cls.query_and_add_to_queries(current_location, language)
            redis_result = db.get_article(current_location, language)
            print("current location ", current_location)
            print("not existing", redis_result)
            return url_name in json.loads(redis_result)["links"]

        return url_name in json.loads(redis_result)["links"]
