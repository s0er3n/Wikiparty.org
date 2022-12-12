import logging

from game.Lobby import Lobby
from game.Player import Player
from game.Response import LobbyUpdate, Response


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
            if isinstance(response.data, LobbyUpdate):
                self.id_lobbies[response.data.id] = lobby

        return response

    def delete_lobby(self):
        pass

    def join_lobby(
        self,
        player: Player,
        id: str | None = None,
        host=False,
        lobby: Lobby | None = None,
    ) -> Response | None:
        if id:
            lobby = self.id_lobbies.get(id)

        if not lobby:
            logging.warning("lobby with that id not found")
            return None

        if player in lobby.players:
            logging.warning("player already in lobby doing nothing")
            return None

        self.player_lobbies[player] = lobby
        lobby.players.append(player)

        if lobby.game:
            return lobby.game.join(player, host=host)
        return None

    def leave_lobby(self, player: Player):
        lobby = self.player_lobbies.get(player)
        if lobby and player not in lobby.players:
            logging.warning("player not in lobby doing nothing")
            return
        if lobby:
            del self.player_lobbies[player]
            lobby.players.remove(player)
