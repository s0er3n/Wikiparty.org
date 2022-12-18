import asyncio
import logging
from threading import Thread
from typing import Any
from bs4 import BeautifulSoup
import requests

from game.ConnectionManager import manager
from game.Player import Player
from game.Response import Response, Wiki

# from collections import defaultdict


def _skip_if_redirect(data):
    soup = BeautifulSoup(data["parse"]["text"]['*'], 'html.parser')
    length = len(soup.find_all('ul', {'class': 'redirectText'}))
    if length == 1:
        href = soup.find('ul', {'class': 'redirectText'}
                         ).find('a', href=True)['href']
        redirect = href.split('/')[2]
        logging.info(f'redirected to {redirect}')
        r = requests.get(
            f"https://en.wikipedia.org/w/api.php?action=parse&page={redirect}&format=json"
        )
        return r.json()
    if length > 1:
        logging.warning(
            "found multiple redirects on redirect page, returning redirect page")
    return data
    logging.error("wtf happend")


class Query:
    # i will query one by one for MVP
    # next_query: dict[str, list[Player]] = defaultdict(list)

    queries: dict[str, Any] = dict()

    @classmethod
    def execute(cls, move: str, recipient: Player):
        # self.next_query[move].apend(recipient)
        if not cls.queries.get(move):
            r = requests.get(
                f"https://en.wikipedia.org/w/api.php?action=parse&page={move}&format=json"
            )
            data = r.json()

            data = _skip_if_redirect(data)

            if len(cls.queries) > 500:
                cls.queries.clear()
            cls.queries[move] = data["parse"]

        thread = Thread(
            target=asyncio.run,
            args=(
                manager.send_response(
                    Response(
                        method="move",
                        data=Wiki(data=cls.queries.get(move)),
                        recipients=[recipient],
                    )
                ),
            ),
        )
        thread.start()
