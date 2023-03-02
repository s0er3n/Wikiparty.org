import uuid

from game.Player.Player import Player
from game.SearchGame import SearchGame


class Lobby:
    players: list[Player]
    game: SearchGame | None
    host: Player
    password_dict: dict[Player, str]

    def __init__(self, host: Player, id: str, Game=SearchGame) -> None:
        self.host = host
        self.players = []
        self.game = Game(host=host, id=id)
        self.password_dict = {}

    def leave(self, player) -> None:
        if isinstance(self.game, SearchGame):
            self.game.leave(player)
        if player in self.players:
            self.players.remove(player)

    def join(self, player, password) -> None:
        if password in self.password_dict:
            if password == self.password_dict[player]:
                self.players.append(player)
                return

        new_player = Player(id=str(uuid.uuid4()))
        # print(player.name())
        # new_player.set_name(player.name())
        self.password_dict[new_player] = password
        self.players.append(new_player)
