from game.settings.logsetup import logger

from game.Player.Player import Player
from game.SearchGame import SearchGame


class Lobby:
    players: list[Player]
    game: SearchGame | None
    host: Player
    password_dict: dict[str, str]

    def __init__(self, host: Player, id: str, Game=SearchGame) -> None:
        self.host = host
        self.players = []
        self.game = Game(host=host, id=id)
        self.password_dict = {}

    def leave(self, player) -> None:
        print("leaving")
        if isinstance(self.game, SearchGame):
            self.game.leave(player)
        if player in self.players:
            self.players.remove(player)

    def join(self, player, password) -> None:
        if player.id in self.password_dict:
            if password == self.password_dict[player.id]:
                self.players.append(player)
                return
            logger.error("wrong password")
            return

        self.password_dict[player.id] = password
        self.players.append(player)
