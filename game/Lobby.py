from game.Player import Player
from game.SearchGame import SearchGame


class Lobby:
    players: list[Player]
    game: SearchGame | None
    host: Player

    def __init__(self, host: Player, id: str):
        self.host = host
        self.players = []
        self.game = SearchGame(host=host, id=id)

    def leave(self, player):
        if isinstance(self.game, SearchGame):
            self.game.leave(player)
        if player in self.players:
            self.players.remove(player)

    def join(self, player):
        self.players.append(player)
