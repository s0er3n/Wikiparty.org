from __future__ import annotations

import dataclasses
from typing import Any, Iterable

from game.Player import Player
from game.PlayerData import PlayerData


@dataclasses.dataclass
class LobbyUpdate:
    state: str
    id: str
    players: list[tuple[Player, PlayerData]]
    articles_to_find: list[str]
    start_article: str


@dataclasses.dataclass
class Wiki:
    data: Any


@dataclasses.dataclass
class Response:
    recipients: Iterable[Player]

    method: str

    data: LobbyUpdate | Error | Wiki

    @staticmethod
    def from_lobby_update(
        lobby_update: LobbyUpdate, recipients: Iterable[Player]
    ) -> Response:
        return Response(method="lobby_update", data=lobby_update, recipients=recipients)


@dataclasses.dataclass
class Error:
    type: str
    sendData: dict
    e: str
