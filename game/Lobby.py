from game.Player import Player
from game.Game import Game


class Lobby:
    players: list[Player]
    game: Game | None

    def __init__(self, host):
        self.players = []
        self.game = Game(host=host, players=None)
