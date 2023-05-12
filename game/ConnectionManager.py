from collections import defaultdict
from re import T
from game.settings.logsetup import logger
from dataclasses import asdict

from threading import Thread
from fastapi import WebSocket

from game.Player.Player import Player
from game.Response import Response

import asyncio


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[Player, list[WebSocket]] = defaultdict(list)
        self.players: dict[str, Player] = {}
        self.password_dict: dict[str, str] = {}
        self.start_ping_thread()

    def start_ping_thread(self):
        async def ping_function():
            while True:
                for player, ws_connections in self.active_connections.items():
                    for ws in ws_connections.copy():
                        try:
                            await ws.send_text("ping")
                        except Exception as e:
                            try:
                                await ws.close()
                                self.active_connections[player].remove(ws)
                            except Exception as e:
                                # logger.warning(f"couldnt close websocket {e}")
                                pass
                            try:
                                logger.info("disconnecting ws")
                                self.active_connections[player].remove(ws)
                            except Exception as e:
                                logger.warning(f"already removed {e}")
                await asyncio.sleep(1)

        thread = Thread(target=asyncio.run, args=(ping_function(),))
        thread.start()

    async def connect(
        self, websocket: WebSocket, id: str, password: str
    ) -> Player | None:
        if self.password_dict.get(id) == password:
            player = self.players.get(id)
        elif not self.password_dict.get(id):
            player = Player(id=id)
            self.players[id] = player
            self.password_dict[id] = password
        else:
            await websocket.close()
            logger.warning(msg="boesewicht")
            return None

        print("connected", websocket)
        self.active_connections[player].append(websocket)
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
        recepients = message._recipients
        message._recipients = []
        for player in recepients:
            if player not in self.active_connections:
                logger.warning("player not in active connections")
                continue
            ws_connections = self.active_connections[player].copy()
            for ws in ws_connections:
                try:
                    await ws.send_json(asdict(message))
                except Exception as e:
                    # print("couldnt send message ", e)
                    try:
                        await ws.close()
                    except Exception as e:
                        logger.warning(f"couldnt close websocket {e}")

                    try:
                        logger.info("disconnecting ws")
                        self.active_connections[player].remove(ws)
                    except Exception as e:
                        logger.warning(f"already removed {e}")


manager = ConnectionManager()
