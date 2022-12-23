from game.Player import Player
from game.SearchGame import SearchGame


class Lobby:
    players: list[Player]
    game: SearchGame | None

    def __init__(self, host, id):
        self.players = []
        self.game = SearchGame(id=id)

    def leave(self, player):
        self.game.leave(player)
        self.players.remove(player)

    def join(self, player):
        self.players.append(player)
