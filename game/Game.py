from game.Player.Player import Player
from game.Response import Response
from enum import Enum


class GameState(Enum):
    idle = "idle"
    ingame = "ingame"
    over = "over"


# base class for different game modes
class Game:
    host: Player

    def leave(self, player: Player) -> Response:
        raise Exception(NotImplemented)

    def join(self, player: Player) -> Response:
        raise Exception(NotImplemented)
