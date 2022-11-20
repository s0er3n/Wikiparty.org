
import pytest


from fastapi.testclient import TestClient

from game.WSServer import app


def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws/123") as websocket:


        new_lobby_msg = {
                    "type": "lobby",
                    "method": "new_lobby",
                    "args": {}
                }

        websocket.send_json(new_lobby_msg)
        # TODO: add join
        data = websocket.receive_json()
        # assert data == {"msg": "Hello WebSocket"}
