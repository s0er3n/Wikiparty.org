import logging
import uuid

from game.Player import Player
from game.Lobby import Lobby
from game.Response import Response


class LobbyServer:
    """handles all lobbies"""

    player_lobbies: dict[Player, Lobby] = {}

    id_lobbies: dict[str, Lobby] = {}

    def new_lobby(self, player: Player) -> Response | None:
        if player in self.player_lobbies:
            self.leave_lobby(player)

        lobby = Lobby(host=player)

        self.player_lobbies[player] = lobby

        response = self.join_lobby(lobby=lobby, player=player, host=True)

        if response:
            self.id_lobbies[response.data.id] = lobby

        return response

    def delete_lobby(self):
        pass

    def join_lobby(self, player: Player, lobby: Lobby, host=False) -> Response | None:
        if player in lobby.players:
            logging.warning("player already in lobby doing nothing")
            return
        self.player_lobbies[player] = lobby
        lobby.players.append(player)

        return lobby.game.join(player, host=host)

    def leave_lobby(self, player: Player):
        lobby = self.player_lobbies.get(player)
        if player not in lobby.players:
            logging.warning("player not in lobby doing nothing")
            return
        del self.player_lobbies[player]
        lobby.players.remove(player)
