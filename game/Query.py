import asyncio
import logging
from threading import Thread
from typing import Any

import requests
from bs4 import BeautifulSoup

from game.Article import Article
from game.ConnectionManager import manager
from game.Player import Player
from game.Response import Response, Wiki

# from collections import defaultdict


def _skip_if_redirect(data):
    soup = BeautifulSoup(data["parse"]["text"]["*"], "html.parser")
    length = len(soup.find_all("ul", {"class": "redirectText"}))
    if length == 1:
        href = soup.find("ul", {"class": "redirectText"}).find("a", href=True)["href"]
        redirect = href.split("/")[2]
        logging.info(f"redirected to {redirect}")
        r = requests.get(
            f"https://en.wikipedia.org/w/api.php?action=parse&page={redirect}&format=json"
        )
        return r.json()
    if length > 1:
        logging.warning(
            "found multiple redirects on redirect page, returning redirect page"
        )
    return data
    logging.error("wtf happend")


class Query:
    # i will query one by one for MVP
    # next_query: dict[str, list[Player]] = defaultdict(list)

    queries: dict[str, Any] = dict()

    @classmethod
    def _add_move_to_queries(cls, move: str):
        r = requests.get(
            f"https://en.wikipedia.org/w/api.php?action=parse&page={move}&format=json"
        )
        data = r.json()

        data = _skip_if_redirect(data)

        if len(cls.queries) > 500:
            cls.queries.clear()
        cls.queries[move] = data["parse"]

    @classmethod
    def execute(cls, move: str, recipient: Player):
        # self.next_query[move].apend(recipient)
        if not cls.queries.get(move):
            cls._add_move_to_queries(move)

        thread = Thread(
            target=asyncio.run,
            args=(
                manager.send_response(
                    Wiki(
                        data=cls.queries.get(move),
                        _recipients=[recipient],
                    )
                ),
            ),
        )
        thread.start()

        return cls.queries.get(move).get("title")
