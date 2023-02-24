from game.Player.Player import Player
from game.Player.PlayerData import PlayerData


class PlayersHandler:

    players: dict[Player, PlayerData]

    players_offline: dict[Player, PlayerData]

    def __init__(self) -> None:
        self.players = {}
        self.players_offline = {}

    def add_player(self, player: Player, player_data: PlayerData) -> None:
        if player not in self.players and player not in self.players_offline:
            self.players[player] = player_data
        if self.players_offline.get(player):
            self.players[player] = self.players_offline[player]
            del self.players_offline[player]

    def get_player_data(self, player: Player) -> PlayerData | None:
        return self.players.get(player)

    def get_all_players_with_data(self):
        return self.players.items()

    def get_all_players(self):
        return self.players.keys()

    def go_offline(self, player: Player) -> None:
        player_data = self.players.get(player)
        if player_data:
            self.players_offline[player] = player_data
            del self.players[player]
