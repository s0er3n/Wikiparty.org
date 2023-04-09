import asyncio
from threading import Thread
from time import sleep
from typing import Any
import requests
import time

from game.Article import Article
from game.ConnectionManager import manager
from game.Game import Game
from game.Game import GameState
from game.Player.Player import Player, PlayerCopy
from game.Player.PlayerData import PlayerData, PlayerRights,  PlayerDataNoNode
from game.Player.PlayersHandler import PlayersHandler
from game.Query.Query import Query
from game.Response import Error, LobbyUpdate, Response, SyncMove
from game.PointsCounter import PointsCounter
from game.RoundData import RoundData


from game.settings.logsetup import logger


class RoundEndChecker:

    def check_for_end(self, player: Player, round_data: RoundData) -> bool:
        return set(article.pretty_name for article in round_data.get_moves(player)).issuperset(round_data.get_articles_to_find_pretty_name())


class SearchGame(Game):
    """handles all the game related stuff"""

    state: GameState = GameState.idle

    host: Player

    rounds: list[RoundData]

    # TODO: why is here the id shouldnt it be in lobby server
    id: str

    round: int = 0

    play_time: int = 600


    def __init__(self, id, host, points_counter=PointsCounter, round_end_checker=RoundEndChecker) -> None:
        self.id = id
        self.host = host
        round_data = RoundData()
        self.rounds = [round_data]
        self.points_counter = points_counter(round_data)
        self.round_end_checker = round_end_checker()
        self.players_handler = PlayersHandler()
        self.language = 'en'

    def set_time(self, player: Player, time: int) -> Response | None:
        if self._check_host(player):
            self.play_time = time
            return self._make_lobby_update_response()
        return

    def join(self, player: Player) -> Response:

        if player == self.host:
            self.players_handler.add_player(player, PlayerData(
                rights=PlayerRights.host,
            ))
        else:
            self.players_handler.add_player(player, PlayerData(
                rights=PlayerRights.normal,
            ))

        if self.state == GameState.ingame:

            next_move = self.rounds[-1].get_current_article(player)
            Query.execute(
                move=next_move.url_name, recipient=player, language=self.language
            )
        return self._make_lobby_update_response()

    def leave(self, player: Player) -> Response | None:
        self.players_handler.go_offline(player)

    def _check_host(self, host: Player) -> bool:
        return self.players_handler.get_player_data(host).rights == PlayerRights.host

    def start(self, host: Player) -> Response | None:

        if not self._check_host(host):
            return

        self.round += 1
        self.state = GameState.ingame

        self._round_timer()
        self.set_starting_position()

        self.rounds[-1].end_time = int(time.time()
                                       * 1000) + self.play_time * 1000

        return self._make_lobby_update_response()

    def go_to_lobby(self, host: Player) -> Response | None:
        if not self._check_host(host):
            return

        self.state = GameState.idle

        self.rounds.append(RoundData())
        self.points_counter.set_new_round(self.rounds[-1])

        return self._make_lobby_update_response()

    def _round_timer(self) -> None:
        async def update_state(round: int):
            sleep(self.play_time)
            if not (self.state == GameState.ingame and round == self.round):
                return
            self.state = GameState.over
            update_response = self._make_lobby_update_response()
            await manager.send_response(update_response)

        thread = Thread(target=asyncio.run, args=(
            update_state(round=self.round),))
        thread.start()

    def set_starting_position(self) -> None:
        for player in self.players_handler.get_all_players():
            Query.execute(
                move=self.rounds[-1].start_article.url_name, recipient=player, language=self.language)

    def set_language(self, host: Player, language: str):
        if not self._check_host(host):
            return
        if self.language != language:
            self.rounds[-1].start_article = Article("", "")
            self.rounds[-1].articles_to_find = set()
            self.language = language
            return self._make_lobby_update_response()

    def _calculate_points_total(self, player: Player) -> int:
        points = 0
        for round in self.rounds:
            if round.points.get(player):
                points += round.points[player]
        return points

    def _make_lobby_update_response(self) -> LobbyUpdate:
        update =  LobbyUpdate(
            articles_to_find=list(
                self.rounds[-1].get_articles_to_find_pretty_name()),
            articles_to_find_description=self.rounds[-1].get_articles_to_find_description(
            ),
            end_time=self.rounds[-1].end_time,
            articles_found=list(
                self.rounds[-1].get_found_articles_pretty_name()),
            start_article=self.rounds[-1].start_article.pretty_name,
            start_article_description=self.rounds[-1].start_article.description,
            id=self.id,
            state=self.state.value,
            time=self.play_time,
            language=self.language,
            players=[
                (
                    PlayerCopy(
                        id=player.id, name=player.name,
                        points_current_round=self.rounds[-1].get_current_points(
                            player),
                        points=self._calculate_points_total(
                            player)
                    ),
                    PlayerDataNoNode(
                        rights=playerData.rights,
                        moves=self.rounds[-1].get_moves(player),
                        current_position=self.rounds[-1].get_current_article(
                            player).url_name,
                    ),
                )
                for player, playerData in self.players_handler.get_all_players_with_data()
            ],
            _recipients=list(self.players_handler.get_all_players()),
        )



    

        return update

    def set_article(self, player: Player, page_id: str, better_name: str, description: str = "", start=False) -> Response:
        if not self._check_host(player):
            return Error(
                e="You are not the host",
                _recipients=[player]
            )

        r = requests.get(
            f"https://{self.language}.wikipedia.org/w/api.php?action=query&prop=info&pageids={page_id}&inprop=url&format=json")
        if r.status_code != 200:
            return Error(
                e="couldnt find article",
                _recipients=[player],
            )
        data = r.json()
        url_name = data["query"]["pages"][str(page_id)]["canonicalurl"].split(
            "/wiki/")[-1]
        if ":" in url_name:
            return Error(
                e="pick a different start article pls :)",
                _recipients=[player]
            )

        if url_name is None:
            return Error(
                e="couldnt find article",
                _recipients=[player],
            )

        if start:
            self.rounds[-1].start_article = Article(
                url_name=url_name, pretty_name=better_name, description=description)
        else:
            self.rounds[-1].articles_to_find.add(
                Article(url_name=url_name, pretty_name=better_name,
                        description=description)
            )

        return self._make_lobby_update_response()

    def move(self, player: Player, url_name: str) -> Response | None:
        """when you click on a new link in wikipedia and move to the next page"""
        if self.state != GameState.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )

        print(url_name)

        if not self._is_move_allowed(url_name=url_name, player=player):
            logger.warning("cheate detected/ or double click")
            # forcing player to reload to correct page
            return SyncMove(_recipients=[player], url_name=self.rounds[-1].get_current_article(player).url_name)

        # needs be after is move allowed otherwise links with # are not allowed bc they are not in the link list
        url_name = url_name.split("#")[0]

        logger.info("move to " + url_name)

        pretty_name = Query.execute(
            move=url_name, recipient=player, language=self.language)

        if pretty_name is None:
            logger.warning("move failed")
            return None

        article = Article(pretty_name=pretty_name, url_name=url_name)

        self.points_counter.check_for_points_on_move(player, article)

        self.rounds[-1].add_move(player, article)

        if self.round_end_checker.check_for_end(player, self.rounds[-1]):
            self.state = GameState.over

        return self._make_lobby_update_response()

    def page_back(self, player: Player):
        if self.state != GameState.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )

        self.rounds[-1].go_back(player)

        url_name = self.rounds[-1].get_current_article(player).url_name

        Query.execute(move=url_name,
                      recipient=player, language=self.language)
        return SyncMove(_recipients=[player], url_name=url_name)

    def page_forward(self, player: Player):
        if self.state != GameState.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )
        self.rounds[-1].go_forward(player)

        url_name = self.rounds[-1].get_current_article(player).url_name

        Query.execute(move=url_name,
                      recipient=player, language=self.language)
        return SyncMove(_recipients=[player], url_name=url_name)

    def _is_move_allowed(self, url_name: str, player: Player) -> bool:
        current_location = self.rounds[-1].get_current_article(player).url_name
        # links is a list of pretty names and the key of queries is the url name
        # WARNING pretty confusing WARNING

        return Query().is_link_allowed(current_location, url_name, language=self.language)
