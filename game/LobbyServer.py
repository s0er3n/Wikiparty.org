import logging

from game.Player import Player
from game.Lobby import Lobby


class LobbyServer:
    """handles all lobbies"""

    lobbies: dict[Player, Lobby] = {}

    def new_lobby(self, player: Player):
        if player in self.lobbies:
            self.leave_lobby(player)

        self.lobbies[player] = Lobby(host=player)

        self.join_lobby(lobby=self.lobbies[player], player=player, host=True)

    def delete_lobby(self):
        pass

    def join_lobby(self, player: Player, lobby: Lobby, host=False):
        if player in lobby.players:
            logging.warning("player already in lobby doing nothing")
            return
        self.lobbies[player] = lobby
        lobby.players.append(player)
        if not host:
            lobby.game.join(player)

    def leave_lobby(self, player: Player, lobby: Lobby):
        if player not in lobby.players:
            logging.warning("player not in lobby doing nothing")
            return
        del self.lobbies[player]
        lobby.players.remove(player)
