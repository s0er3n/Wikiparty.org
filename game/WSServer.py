import logging

from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect

from game.ConnectionManager import manager
from game.Game import Game, Player
from game.LobbyServer import LobbyServer
from game.Response import Error, Response
from game.SearchQuery import SearchQuery

app = FastAPI()


lobbyServer = LobbyServer()


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    player = await manager.connect(websocket, id=client_id)
    try:
        while True:
            data = await websocket.receive_json()

            match data:

                case {
                    "type": "game" | "lobby" | "player" | "search",
                    "method": method,
                    "args": args,
                }:
                    # try:
                    if method.startswith("_"):
                        raise Exception("not allowed")


                        if data.get("type") == "player":
                            target: SearchQuery | Game | LobbyServer | Player = player
                        elif data.get("type") == "game":
                            lobby = lobbyServer.player_lobbies.get(player)
                            if lobby and (game := lobby.game):
                                target = game
                        elif data.get("type") == "search":
                            target = SearchQuery()
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
        # await manager.broadcast(f"Client #{client_id} left the chat")
