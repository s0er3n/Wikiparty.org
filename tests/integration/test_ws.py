import pytest


from fastapi.testclient import TestClient

from game.WSServer import app


def test_websocket():
    client = TestClient(app)

    with client.websocket_connect("/ws/1") as websocket:

        start_game_msg = {"type": "lobby", "method": "new_lobby", "args": {}}

        websocket.send_json(start_game_msg)
        # TODO: add join
        data = websocket.receive_json()
        print(data)
        assert data.get("players") == [
            ["unnamed player", {"rights": "host", "state": "watching", "moves": []}]
        ]

    with client.websocket_connect("/ws/2") as websocket:
        join_lobby_msg = {
            "type": "lobby",
            "method": "join_lobby",
            "args": {"id": data["id"]},
        }
        websocket.send_json(join_lobby_msg)
        data = websocket.receive_json()
        print(data)
        assert len(data.get("players")) == 2

    with client.websocket_connect("/ws/1") as websocket:

        start_game_msg = {"type": "game", "method": "start", "args": {}}

        websocket.send_json(start_game_msg)
        # TODO: add join
        data = websocket.receive_json()

        print(data)
