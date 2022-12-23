from game.Player import Player
from game.Response import Response


class Game:
    def leave(self, player: Player) -> Response:
        raise Exception(NotImplemented)

    def join(self, player: Player, host: bool) -> Response:
        raise Exception(NotImplemented)
