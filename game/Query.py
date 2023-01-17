import asyncio
import logging
import redis
from threading import Thread
from typing import Iterator
import json
import requests
from bs4 import BeautifulSoup

from game.Player import Player
from game.Response import Wiki
from game.QueryResult import QueryResult
from game.ConnectionManager import manager


def _select_and_reduce_links(all_links) -> Iterator[str]:
    for link in all_links:
        if link["href"].startswith("/wiki/") and not link["href"].startswith("/wiki/Help") and not link["href"].startswith("/wiki/File"):
            yield link["href"][6::]


redis_client = redis.Redis(host="localhost", port=6379, db=0)


class Query:

    @classmethod
    def query_and_add_to_queries(cls, move: str) -> str | None:
        logging.warning(f"add move to query {move}")
        resp = requests.get(
            f"https://en.wikipedia.org/wiki/{move}"
        )
        resp_text = resp.text

        if resp.history:
            move = resp.history[-1].url

        soup = BeautifulSoup(resp_text, "lxml")

        if not (h1 := soup.find("h1")):
            logging.warning("no h1")
            return None
        title = h1.text

        article = soup.find("div", {"id": "mw-content-text"})

        # data = _skip_if_redirect(data)

        all_links = soup.find_all("a", href=True)

        short_links = list(_select_and_reduce_links(all_links))

        redis_client.set("article:" + move, json.dumps({"links": short_links,
                                                        "title": str(title),
                                                       "content_html": str(article),
                                                        "url_ending": move}), ex=60 * 60 * 24 * 14)
        return move

    @classmethod
    def execute(cls, move: str, recipient: Player) -> str | None:
        if not redis_client.get("article:" + move):
            logging.warning(f"before try move {move}")
            try:
                move = cls.query_and_add_to_queries(move)
                assert move is not None
            except:
                logging.error("could not query wikipedia")
                return

        if not (query_result := redis_client.get("article:" + move)):
            logging.warning("no query result")
            return None
        query_result = json.loads(query_result)
        redis_client.hincrby("count", move)
        thread = Thread(
            target=asyncio.run,
            args=(
                manager.send_response(
                    Wiki(
                        data=query_result,
                        _recipients=[recipient],
                    )
                ),
            ),
        )
        thread.start()
        return query_result["title"]

    @classmethod
    def is_link_allowed(cls, current_location, url_name) -> bool:
        if not (redis_result := redis_client.get(current_location)):
            # requerying current location in case it was not in redis
            cls.query_and_add_to_queries(current_location)
            redis_result = redis_client.get("article:" + current_location)

        return url_name in json.loads(redis_result)["links"]


def test_query() -> None:
    target = "berlin"
    Query.query_and_add_to_queries(target)
    assert json.loads(redis_client.get("article:" + target)) is not None
