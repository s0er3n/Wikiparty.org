from __future__ import annotations

import dataclasses

from src.game.Player.Player import Player, PlayerCopy
from src.game.Player.PlayerData import PlayerDataNoNode
from src.game.Query.QueryResult import QueryResult


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
    articles_to_find_description: dict[str, str]
    articles_found: list[str]
    start_article: str
    start_article_description: str
    time: int
    language: str


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


@dataclasses.dataclass(kw_only=True)
class SyncMove(Response):
    method: str = "SyncMove"
    url_name: str
