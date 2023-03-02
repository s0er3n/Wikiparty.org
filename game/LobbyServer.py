from game.settings.logsetup import logger
import uuid

from game.Lobby import Lobby
from game.Player.Player import Player
from game.Response import Response, LobbyNotFound


class LobbyServer:
    """handles all lobbies"""

    players_lobbies: dict[Player, Lobby] = {}

    id_lobbies: dict[str, Lobby] = {}

    def new_lobby(self, player: Player) -> Response | None:

        id = str(uuid.uuid4())
        lobby = Lobby(host=player, id=id)

        self.id_lobbies[id] = lobby

        return self.join_lobby(lobby=lobby, player=player)

    def delete_lobby(self) -> None:
        raise Exception(NotImplemented)

    def join_lobby(
        self,
        player: Player,
        id: str | None = None,
        lobby: Lobby | None = None,
    ) -> Response | None:

        if self.players_lobbies.get(player):
            self.players_lobbies[player].leave(player)
            self.leave_lobby(player)

        if id:
            lobby = self.id_lobbies.get(id)

        if not lobby:
            logger.warning("lobby with that id not found")
            return LobbyNotFound(_recipients=[player])

        # if player in lobby.players:
        #     logger.warning("player already in lobby doing nothing")
        #     return None

        self.players_lobbies[player] = lobby

        lobby.join(player)

        if lobby.game:
            return lobby.game.join(player)
        return None

    def leave_lobby(self, player: Player) -> None:
        lobby = self.players_lobbies.get(player)
        if player not in lobby.players:
            logger.warning("player not in lobby doing nothing")
            return
        if lobby:
            lobby.leave(player)
            del self.players_lobbies[player]
