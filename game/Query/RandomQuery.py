from __future__ import annotations
import asyncio
from threading import Thread
import random
import requests

from game.ConnectionManager import manager
from game.Player.Player import Player
from game.Response import Random
import game.db


from typing import List, TypedDict


class Response(TypedDict):
    start: int
    end: int
    count: int
    type: str
    pageSize: int
    page: int
    pages: int
    columns: List[Column]
    items: List[Item]
    list: str
    miniList: str


class Column(TypedDict):
    label: str
    property: str
    sortable: bool


class Item(TypedDict):
    harmonic: str


class RandomQuery:
    @staticmethod
    def execute(player: Player):
        # querying 100K pages

        if not game.db.client.exists("randomwords"):

            r = requests.get(
                f"http://wikirank-2022.di.unimi.it/Q/?filter%5Btext%5D=Harmonic+centrality&filter%5Bselected%5D=true&filter%5Bvalue%5D=harmonic&view=list&pageSize=100000&pageIndex=0&type=harmonic&score=false"
            )
            data: Response = r.json()

            print(data)

            article_names = [article["harmonic"].split(
                ">")[1].split("<")[0] for article in data["items"]]

            if r.status_code == 200:
                game.db.client.sadd(
                    "randomwords", *article_names)

        random_words = game.db.client.srandmember(
            "randomwords", 10)
        random_words = [word.decode("utf-8") for word in random_words]
        thread = Thread(
            target=asyncio.run,
            args=(manager.send_response(
                Random(data=random_words, _recipients=[player])),),
        )
        thread.start()
