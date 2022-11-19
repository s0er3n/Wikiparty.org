import dataclasses
import logging
from enum import Enum, auto

from game.Player import Player


class State(Enum):
    idle = auto()
    fleeing = auto()
    finding = auto()
    over = auto()


class PlayerRights(Enum):
    host = auto()
    normal = auto()


class PlayerState(Enum):
    hunting = auto()
    fleeing = auto()
    catched = auto()
    watching = auto()


@dataclasses.dataclass
class PlayerData:
    rights: PlayerRights

    state: PlayerState = PlayerState.watching

    moves: list[str] = dataclasses.field(
        default_factory=list
    )


class Game:
    """handles all the game related stuff"""

    state: State = State.idle

    points: dict[Player, int]

    players: dict[Player, PlayerData] | None

    def __init__(self, host: Player, players: None | list[Player]):
        self.points = {}
        self.players = {host: PlayerData(
            rights=PlayerRights.host,
        )}

        if players:
            for player in players:
                self.players[player] = PlayerData(
                    rights=PlayerRights.normal,
                )

    def join(self, player: Player):
        self.players[player] = PlayerData(
            rights=PlayerRights.normal,
        )

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

        if not (fleeing and hunting):
            logging.warning("cannot start game we need both a hunter and someone fleeing")
            return

        self.points = {}
        self.set_starting_position()
        self.state = State.fleeing

    def set_role(self, host: Player, player: Player,
                 role: PlayerState):
        if self._check_host(host):
            return
        if not State.idle:
            logging.warning("someone tried to change the role while ingame/gameover")
            return

        if not (role == PlayerState.hunting or
                role == PlayerState.fleeing or
                role == PlayerState.watching
        ):
            logging.warning("cannot give you that role")
            return

        self.players[player].state = role

    def set_starting_position(self):
        """gets a random wiki page to start"""
        print("setting start position")
        print(self.players.values())
        for data in self.players.values():
            data.moves = ["test"]

    def move(self, player: Player, target: str):
        """when you click on a new link in wikipedia and move to the next page"""
        # TODO: send the new page to the query
        if self.state != State.fleeing and self.state != State.finding:
            logging.warning("not allowed to move")
            return

        if self.state == State.fleeing:
            if self.players[player].state != PlayerState.fleeing:
                logging.warning("cannot move if you are not the player fleeing")
                return

        if self.players[player].state == PlayerState.watching:
            logging.warning("Watching People cannot not move")
            return

        self.players[player].moves.append(target)

        self._check_if_catched(move=target, moved_player=player)

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
