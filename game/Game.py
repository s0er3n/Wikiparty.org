import logging
import uuid
from threading import Thread
from time import sleep
import asyncio

from game.Query import Query

from game.Player import Player
from game.PlayerData import PlayerRights, PlayerState, PlayerData
from game.Response import Response, LobbyUpdate, Error
from game.GameState import State
from game.ConnectionManager import manager


class Game:
    """handles all the game related stuff"""

    state: State = State.idle

    points: dict[Player, int]

    players: dict[Player, PlayerData]

    id: str

    def __init__(self):
        self.points = {}
        self.players = {}
        self.id = str(uuid.uuid4())

    def join(self, player: Player, host: bool) -> Response:
        if host:
            self.players[player] = PlayerData(
                rights=PlayerRights.host,
            )
        else:
            self.players[player] = PlayerData(
                rights=PlayerRights.normal,
            )

        return self._make_lobby_update_response()

    def leave(self):
        pass

    def _check_host(self, host: Player):
        logging.warning("not allowed to start the game")
        return self.players[host].rights != PlayerRights.host

    def start(self, host: Player):
        if self._check_host(host):
            return

        if self.players[host].rights != PlayerRights.host:
            logging.warning("not allowed to start the game")
            return

        fleeing = 0
        hunting = 0

        for data in self.players.values():
            if data.state == PlayerState.fleeing:
                fleeing += 1

            elif data.state == PlayerState.hunting:
                hunting += 1
            # if we have both someone fleeing and someone hunting we can start the game
            if fleeing and hunting:
                break
        self.set_starting_position()

        if not (fleeing and hunting):
            logging.warning(
                "cannot start game we need both a hunter and someone fleeing"
            )
            return Response(
                method="Error",
                data=Error(
                    type="message not found", sendData={},
                    e="cannot start game we need both a hunter and someone fleeing"),
                recipients=[host]
            )

        self.points = {}
        self.state = State.fleeing
        self._fleeing_timer()
        return self._make_lobby_update_response()

    def _fleeing_timer(self):
        async def update_state():
            sleep(15)
            self.state = State.finding
            update_response = self._make_lobby_update_response()
            await manager.send_response(update_response)

        thread = Thread(target=asyncio.run, args=(update_state(),))
        thread.start()

    def set_role(self, host: Player, player_id: str, role: str):
        player = next(
            player for player in self.players if player.id == player_id)

        role = PlayerState(role)
        if self._check_host(host):
            return
        if not State.idle:
            logging.warning(
                "someone tried to change the role while ingame/gameover")
            return

        if not (
                role == PlayerState.hunting
                or role == PlayerState.fleeing
                or role == PlayerState.watching
        ):
            logging.warning("cannot give you that role")
            return

        self.players[player].state = role

        return self._make_lobby_update_response()

    def set_starting_position(self):
        """gets a random wiki page to start"""
        print("setting start position")
        print(self.players.values())
        for data in self.players.values():
            data.moves.clear()
            data.moves.append("test")

        for player in self.players:
            Query.execute(move="test", recipient=player)

    def _make_lobby_update_response(self) -> Response:
        return Response.from_lobby_update(
            lobby_update=LobbyUpdate(
                id=self.id,
                state=self.state.value,
                players=[(player, data)
                         for player, data in self.players.items()],
            ),
            recipients=self.players.keys(),
        )

    def move(self, player: Player, target: str) -> Response:
        """when you click on a new link in wikipedia and move to the next page"""
        # TODO: send the new page to the query

        if self.state != State.fleeing and self.state != State.finding:
            logging.warning("not allowed to move")
            return Response(
                method="Error",
                data=Error(
                    type="message not found", sendData={},
                    e="not allowed to move"),
                recipients=[player]
            )

        if self.state == State.fleeing:
            if self.players[player].state != PlayerState.fleeing:
                logging.warning(
                    "cannot move if you are not the player fleeing")
                return Response(
                    method="Error",
                    data=Error(
                        type="message not found", sendData={},
                        e="cannot move if you are not the player fleeing"),
                    recipients=[player])

        if self.players[player].state == PlayerState.watching:
            logging.warning("Watching People cannot not move")
            return Response(
                method="Error",
                data=Error(
                    type="message not found", sendData={},
                    e="Watching People cannot not move"),
                recipients=[player])

        Query.execute(move=target, recipient=player)
        self.players[player].moves.append(target)

        self._check_if_catched(move=target, moved_player=player)

        return self._make_lobby_update_response()

    def _check_if_catched(self, move: str, moved_player: Player):
        for player, data in self.players.items():
            print(data.moves)
            if player != moved_player and data.moves[-1] == move:
                logging.warning("player found")
                data.state = PlayerState.catched
                self._check_if_game_over()

    def _check_if_game_over(self):
        for data in self.players.values():
            if data.state == PlayerState.fleeing:
                logging.info("someone is still fleeing")
                return

        self.state = State.over
