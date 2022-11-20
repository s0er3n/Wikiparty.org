from __future__ import annotations
from typing import Iterable
import dataclasses

from game.PlayerData import PlayerData
from game.Player import Player


@dataclasses.dataclass
class LobbyUpdate:
    id: str
    players: dict[str, PlayerData]

@dataclasses.dataclass
class Response:
    recipients: Iterable[Player]

    method: str

    data: LobbyUpdate

    @staticmethod
    def from_lobby_update(lobby_update: LobbyUpdate, recipients: Iterable[Player]) -> Response:
        return Response(method="lobby_update", data=lobby_update, recipients=recipients)



