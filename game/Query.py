import asyncio
from game.logsetup import logger
from threading import Thread
from typing import Iterator
import json
import requests
from bs4 import BeautifulSoup

from game.Player import Player
from game.Response import Wiki
from game.QueryResult import QueryResult
from game.ConnectionManager import manager

import game.db


def _select_and_reduce_links(all_links) -> Iterator[str]:
    for link in all_links:
        if link["href"].startswith("/wiki/") and not link["href"].startswith("/wiki/Help") and not link["href"].startswith("/wiki/File"):
            yield link["href"][6::]


class Query:

    @classmethod
    def query_and_add_to_queries(cls, move: str) -> str | None:
        logger.warning(f"add move to query {move}")
        resp = requests.get(
            f"https://en.wikipedia.org/wiki/{move}"
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

        game.db.client.set("article:" + move, json.dumps({"links": short_links,
                                                          "title": str(title),
                                                          "url_ending": move}), ex=60 * 60 * 24)
        return move

    @classmethod
    def execute(cls, move: str, recipient: Player) -> str | None:
        if not game.db.get_article(move):
            try:
                move = cls.query_and_add_to_queries(move)
                assert move is not None
            except:
                logger.error("could not query wikipedia")
                return

        if not (query_result := game.db.get_article(move)):
            logger.warning("no query result")
            return None
        query_result = json.loads(query_result)
        game.db.client.hincrby("count", move)
        return query_result["title"]

    @classmethod
    def is_link_allowed(cls, current_location, url_name) -> bool:
        redis_result = game.db.get_article(current_location)
        if not redis_result:
            # requerying current location in case it was not in redis
            cls.query_and_add_to_queries(current_location)
            redis_result = game.db.get_article(current_location)
            print("current location ", current_location)
            print("not existing", redis_result)
            return url_name in json.loads(redis_result)["links"]

        return url_name in json.loads(redis_result)["links"]


def test_query() -> None:
    target = "berlin"
    Query.query_and_add_to_queries(target)
    assert json.loads(game.db.client.get(
        "article:" + target)) is not None
