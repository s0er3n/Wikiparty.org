from enum import Enum

from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect

from game.Player import Player

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # TODO:
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[Player, WebSocket] = {}
        self.players: dict[str, Player] = {}

    async def connect(self, websocket: WebSocket, id: str) -> Player:
        await websocket.accept()
        player = self.players.get(id)
        if not player:
            player = Player()
            self.players[id] = player

        self.active_connections[player] = websocket
        return player

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, player: Player):
        await self.active_connections[player].send_json(message)

    async def send_group_message(self, message: dict, players: list[Player]):
        for player in players:
            await self.active_connections[player].send_json(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)


manager = ConnectionManager()


class MessagesIncoming(Enum):
    new_lobby = "new_lobby"

class MessagesOutgoing(Enum):
    state = "state"


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    player = await manager.connect(websocket, id=client_id)
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message")
            if message == MessagesIncoming.new_lobby.value:
                await manager.send_personal_message({
                    "message": MessagesOutgoing.state.value,
                    "data": "lobby created"
                }, player)
            else:
                await manager.send_personal_message(f"message not found {message}", player)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")