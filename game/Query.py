import asyncio
from threading import Thread
from typing import Any

import requests

from game.ConnectionManager import manager
from game.Player import Player
from game.Response import Response, Wiki

# from collections import defaultdict


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
