from game.Response import Response, Error
from game.LobbyServer import LobbyServer
from starlette.websockets import WebSocketDisconnect
from fastapi import FastAPI, WebSocket
import logging

from game.ConnectionManager import manager

app = FastAPI()


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
                            target = lobbyServer.player_lobbies.get(
                                player).game
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
