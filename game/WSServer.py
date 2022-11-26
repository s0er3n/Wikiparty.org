from game.Response import Response, Error
from game.Player import Player
from game.LobbyServer import LobbyServer
from starlette.websockets import WebSocketDisconnect
from fastapi import FastAPI, WebSocket
from dataclasses import asdict
import logging


app = FastAPI()


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

    def disconnect(self, player: Player):
        del self.active_connections[player]

    async def send_personal_message(self, message: dict, player: Player):
        await self.active_connections[player].send_json(message)

    async def send_response(self, message: Response | None):
        if not message:
            logging.warning("no response")
            return

        for player in message.recipients:
            try:
                await self.active_connections[player].send_json(asdict(message.data))
            except Exception as e:
                print("couldnt send message ", e)

    async def send_group_message(self, message: dict, players: list[Player]):
        for player in players:
            await self.active_connections[player].send_json(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)


manager = ConnectionManager()


lobbyServer = LobbyServer()


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    player = await manager.connect(websocket, id=client_id)
    try:
        while True:
            data = await websocket.receive_json()

            match data:
                # FIXME: maybe unsafe?
                case {"type": "game" | "lobby", "method": method, "args": args}:
                    try:
                        if method.startswith("_"):
                            raise Exception("not allowed")
                        if data.get("type") == "game":
                            target = lobbyServer.player_lobbies.get(player).game
                        else:
                            target = lobbyServer
                        await manager.send_response(
                            getattr(target, method)(player, **args)
                        )
                    except Exception as e:
                        print(e)
                        await manager.send_response(
                            message=Response(
                                method="Error",
                                data=Error(
                                    type="message not found", sendData=data, e=str(e)
                                ),
                                recipients=[player],
                            )
                        )

                case _:
                    await manager.send_response(
                        message=Response(
                            method="Error",
                            data=Error(
                                type="message not found",
                                sendData=data,
                                e="not matching anything",
                            ),
                            recipients=[player],
                        )
                    )

            #     await manager.send_personal_message(
            #         asdict(lobbyServer.new_lobby(player)), player)
            # else:

    except WebSocketDisconnect:
        manager.disconnect(player)
        await manager.broadcast(f"Client #{client_id} left the chat")
