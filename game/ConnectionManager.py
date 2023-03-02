from game.settings.logsetup import logger
from dataclasses import asdict

from fastapi import WebSocket

from game.Player.Player import Player
from game.Response import Response


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[Player, WebSocket] = {}
        self.players: dict[str, Player] = {}
        self.password_dict: dict[str, str] = {}

    async def connect(self, websocket: WebSocket, id: str, password: str) -> Player:
        await websocket.accept()

        if self.password_dict.get(id) == password:
            player = self.players.get(id)
        elif not self.password_dict.get(id):
            player = Player(id=id)
            self.players[id] = player
            self.password_dict[id] = password
        else await websocket.close()
        self.active_connections[player] = websocket
        return player

    def disconnect(self, player: Player) -> None:
        try:
            del self.active_connections[player]
        except KeyError:
            logger.warning(
                "could not disconnect player he is not in the active connections"
            )

    async def send_response(self, message: Response | None) -> None:
        if not message:
            logger.warning("no response")
            return
        if message.method == "Error":
            logger.warning(message.e)

        for player in message._recipients:
            if player not in self.active_connections:
                logger.warning("player not in active connections")
                continue
            try:
                message._recipients = []
                await self.active_connections[player].send_json(asdict(message))
            except Exception as e:
                print("couldnt send message ", e)


manager = ConnectionManager()
