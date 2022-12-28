import asyncio
import logging
from threading import Thread
from typing import Any
import pytest
import json

import requests
from bs4 import BeautifulSoup

from game.Article import Article
from game.ConnectionManager import manager
from game.Player import Player
from game.Response import Response, Wiki


def _select_and_reduce_links(all_links):
    for link in all_links:
        if link["href"].startswith("/wiki/") and not link["href"].startswith("/wiki/Help") and not link["href"].startswith("/wiki/File"):
            yield link["href"][6::]


class Query:
    # i will query one by one for MVP
    # next_query: dict[str, list[Player]] = defaultdict(list)

    queries: dict[str, Any] = dict()

    @classmethod
    def _query_and_add_to_queries(cls, move: str):
        logging.warning(f"add move to query {move}")
        resp_text = requests.get(
            f"https://en.wikipedia.org/wiki/{move}"
        ).text

        soup = BeautifulSoup(resp_text, "html.parser")

        title = soup.find("h1").text

        article = soup.find("div", {"id": "mw-content-text"})

        # data = _skip_if_redirect(data)

        all_links = soup.find_all("a", href=True)

        short_links = list(_select_and_reduce_links(all_links))

        if len(cls.queries) > 500:
            cls.queries.clear()
        cls.queries[move] = {"links": short_links,
                             "title": str(title),
                             "content_html": str(article),
                             "url_ending": move}

    @classmethod
    def execute(cls, move: str, recipient: Player):
        if not cls.queries.get(move):
            logging.warning(f"before try move {move}")
            try:
                cls._query_and_add_to_queries(move)
            except:
                logging.error("could not query wikipedia")
                return

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

        return cls.queries.get(move)["title"]


def test_query():
    target = "berlin"
    assert Query._query_and_add_to_queries(target)
