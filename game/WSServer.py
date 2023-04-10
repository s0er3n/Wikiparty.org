import uvicorn
import logging
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from game.settings.logsetup import logger
from time import sleep

from game.ConnectionManager import manager
from game.LobbyServer import LobbyServer
from game.Response import Error
from game.SearchGame import Player, SearchGame
from game.Query.SearchQuery import SearchQuery
from game.Query.RandomQuery import RandomQuery

app = FastAPI()


lobbyServer = LobbyServer()

logger.setLevel(logging.INFO)


@app.get("/")
def index() -> str:
    return "hallo"


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):

    await websocket.accept()
    try:
        password = await websocket.receive_text()
    except Exception:
        await websocket.close()
        return
    player = await manager.connect(websocket, id=client_id, password=password)
    if not player:
        return
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception as e:
                logger.error(f"stupid websocket library {e}")
                try:
                    await websocket.close()
                except:
                    pass
                break

            logger.info(data)

            match data:

                case {
                    "type": "game" | "lobby" | "player" | "search" | "random",
                    "method": method,
                    "args": args,
                }:
                    if method.startswith("_"):
                        await manager.send_response(Error(e="not allowed", _recipients=[player]))
                        continue
                    target: SearchQuery | RandomQuery | SearchGame | LobbyServer | Player | None = None
                    if data.get("type") == "player":
                        target = player
                    elif data.get("type") == "game":
                        lobby = lobbyServer.players_lobbies.get(player)
                        if lobby and (game := lobby.game):
                            target = game
                    elif data.get("type") == "search":
                        target = SearchQuery()
                    elif data.get("type") == "random":
                        target = RandomQuery()
                    else:
                        target = lobbyServer
                    # try:
                    await manager.send_response(getattr(target, method)(player, **args))
                    # except Exception as e:
                    #     await manager.send_response(Error(e=str(e), _recipients=[player]))
                    #
                case _:
                    await manager.send_response(
                        message=Error(
                            _recipients=[player],
                            e="not matching anything",
                        )
                    )

            #     await manager.send_personal_message(
            #         asdict(lobbyServer.new_lobby(player)), player)
            # else:

    except WebSocketDisconnect:
        manager.disconnect(player)
