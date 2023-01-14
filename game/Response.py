from __future__ import annotations

import dataclasses

from game.Player import Player, PlayerCopy
from game.PlayerData import PlayerDataNoNode
from game.QueryResult import QueryResult


@dataclasses.dataclass(kw_only=True)
class Response:
    _recipients: list[Player]

    method: str


@dataclasses.dataclass(kw_only=True)
class Error(Response):
    e: str
    method: str = "Error"


@dataclasses.dataclass(kw_only=True)
class LobbyUpdate(Response):
    method: str = "LobbyUpdate"
    end_time: int
    state: str
    id: str
    players: list[tuple[PlayerCopy, PlayerDataNoNode]]
    articles_to_find: list[str]
    articles_found: list[str]
    start_article: str
    time: int


@dataclasses.dataclass(kw_only=True)
class Wiki(Response):
    data: QueryResult
    method: str = "Wiki"


@dataclasses.dataclass(kw_only=True)
class Random(Response):
    data: list[str]
    method: str = "Random"


@dataclasses.dataclass(kw_only=True)
class LobbyNotFound(Response):
    method: str = "LobbyNotFound"
