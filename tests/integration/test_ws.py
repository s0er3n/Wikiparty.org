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
        assert len(data.get("players")) == 1

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
        p1_id = data["players"][0][0]["id"]
        p2_id = data["players"][1][0]["id"]
        print(p1_id, p2_id)

    with client.websocket_connect("/ws/1") as websocket:
        start_game_msg = {"type": "game", "method": "start", "args": {}}

        websocket.send_json(start_game_msg)
        data = websocket.receive_json()

        assert data['e'] == "cannot start game we need both a hunter and someone fleeing"

        print(data)

        move_msg = {"type": "game", "method": "move",
                    "args": {"target": p1_id}}

        websocket.send_json(move_msg)
        data = websocket.receive_json()

        assert data['e'] == "not allowed to move"

        print(data)
        # TODO: set roles

        set_role_msg = {"type": "game", "method": "set_role", "args": {
            "player_id": p1_id,
            "role": "hunting"}}

        websocket.send_json(set_role_msg)
        # TODO: get update
        set_role_msg = {"type": "game", "method": "set_role", "args": {
            "player_id": p1_id,
            "role": "fleeing"}}
        websocket.send_json(set_role_msg)

        # TODO: get update

        websocket.send_json(start_game_msg)
        data = websocket.receive_json()

        print(data)
        assert data['e'] == "cannot start game we need both a hunter and someone fleeing"

