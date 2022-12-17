import asyncio
import logging
import uuid
from threading import Thread
from time import sleep

from game.ConnectionManager import manager
from game.GameState import State
from game.Player import Player, PlayerCopy
from game.PlayerData import PlayerData, PlayerRights, PlayerState
from game.Query import Query
from game.Response import Error, LobbyUpdate, Response
from collections import defaultdict


class Game:
    """handles all the game related stuff"""

    state: State = State.idle

    points: dict[Player, int]

    players: dict[Player, PlayerData]

    articles_to_find: set[str]

    found_articles: set[str]

    start_article: str = ""

    id: str

    play_time: int

    def __init__(self):
        self.points = defaultdict(int)
        self.players = {}
        self.id = str(uuid.uuid4())
        self.articles_to_find = set()
        self.found_articles = set()
        self.play_time = 60

    def set_time(self, player: Player, time: int):
        if self._check_host(player):
            self.play_time = time
            return self._make_lobby_update_response()

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
        logging.warning("no admin rights")
        return self.players[host].rights != PlayerRights.host

    def start(self, host: Player):
        if self._check_host(host):
            return

        if not self.start_article:
            return

        if self.players[host].rights != PlayerRights.host:
            logging.warning("not allowed to start the game")
            return

        self.state = State.ingame
        self._round_timer()
        self.set_starting_position()
        for player_data in self.players.values():
            player_data.state = PlayerState.hunting

        return self._make_lobby_update_response()

    def _round_timer(self):
        async def update_state():
            sleep(self.play_time)
            if self.state == State.ingame:
                self.state = State.over
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

        if not (role == PlayerState.hunting or role == PlayerState.watching):
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
            data.moves.append(self.start_article)

        for player in self.players:
            Query.execute(move=self.start_article, recipient=player)

    def _make_lobby_update_response(self) -> Response:
        return Response.from_lobby_update(
            lobby_update=LobbyUpdate(
                articles_to_find=list(self.articles_to_find),
                start_article=self.start_article,
                id=self.id,
                state=self.state.value,
                time=self.play_time,
                players=[
                    (PlayerCopy(id=player.id, name=player.name), data)
                    for player, data in self.players.items()
                ],
            ),
            recipients=self.players.keys(),
        )

    def set_article(self, player: Player, article: str, start=False):

        if start:
            self.start_article = article
        else:
            self.articles_to_find.add(article)

        return self._make_lobby_update_response()

    def move(self, player: Player, target: str) -> Response:
        """when you click on a new link in wikipedia and move to the next page"""
        # TODO: send the new page to the query

        if self.state != State.ingame:
            logging.warning("not allowed to move")
            return Response(
                method="Error",
                data=Error(
                    type="message not found", sendData={}, e="not allowed to move"
                ),
                recipients=[player],
            )

        if (
            self.players[player].state == PlayerState.watching
            or self.players[player].state == PlayerState.finnished
        ):
            logging.warning("Watching People cannot not move")
            return Response(
                method="Error",
                data=Error(
                    type="message not found",
                    sendData={},
                    e="Watching People cannot not move",
                ),
                recipients=[player],
            )

        # TODO: check if all found => end game early
        # TODO: self.articles_to_find.issubset(set(moves))

        if target in self.articles_to_find:
            if target not in self.players[player].moves:
                logging.warning("article found")
                self.points[player] += 10
                if target not in self.found_articles:
                    logging.warning("fist time this article was found")
                    self.points[player] += 5
                    self.found_articles.add(target)
                logging.warning(
                    f'player {player.name} has{self.points[player]} points')
        self.players[player].moves.append(target)
        if self._check_if_player_found_all(player):
            self.state = State.over
        Query.execute(move=target, recipient=player)

        # self._check_if_catched(move=target, moved_player=player)

        # TODO: update found

        return self._make_lobby_update_response()

    def _check_if_player_found_all(self, player: Player):
        if player_data := self.players.get(player):
            return self.articles_to_find.issubset(set(player_data.moves))
