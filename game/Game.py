from game.Player import Player
from game.Response import Response


class Game:
    host: Player

    def leave(self, player: Player) -> Response:
        raise Exception(NotImplemented)

    def join(self, player: Player) -> Response:
        raise Exception(NotImplemented)
