import asyncio
import logging
from collections import defaultdict
from threading import Thread
from time import sleep
import time

from game.Article import Article
from game.ConnectionManager import manager
from game.Game import Game
from game.GameState import State
from game.Player import Player, PlayerCopy
from game.PlayerData import PlayerData, PlayerRights,  PlayerDataNoNode, Node, sorted_moves_list
from game.Query import Query
from game.Response import Error, LobbyUpdate, Response, SyncMove
from dataclasses import dataclass, field

logging.getLogger().setLevel(logging.INFO)


@dataclass
class Moves:
    start: Node
    current: Node

    def get_moves(self) -> list[Article]:
        return [node.article for node in sorted_moves_list(self.start, [])]

    def go_back(self) -> None:
        if self.current.parent is not None:
            self.current = self.current.parent

    def go_forward(self) -> None:
        if self.current.children:
            self.current = self.current.children[-1]


def create_defaultdict():
    return defaultdict(int)


@dataclass
class RoundData:
    """Data for a single round of the game."""

    points: dict[Player, int] = field(default_factory=create_defaultdict)

    moves: dict[Player, Moves] = field(default_factory=dict)

    articles_to_find: set[Article] = field(default_factory=set)

    found_articles: set[Article] = field(default_factory=set)

    start_article: Article = Article("", "")

    end_time: int = 0

    def get_articles_to_find_pretty_name(self) -> set[str]:
        return set(article.pretty_name for article in self.articles_to_find)

    def get_articles_to_find_description(self) -> dict[str, str]:
        return {article.pretty_name:  article.description for article in self.articles_to_find}

    def get_found_articles_pretty_name(self) -> set[str]:
        return set(article.pretty_name for article in self.found_articles)

    def add_move(self, player: Player, article: Article):
        """Add a move to the round data."""
        if player not in self.moves:
            start_node = Node(self.start_article, parent=None)
            new_node = start_node.add_child(article)
            self.moves[player] = Moves(start_node, new_node)
        else:
            self.moves[player].current = self.moves[player].current.add_child(
                article)

    def get_points(self, player: Player) -> int:
        """Get the points of a player."""
        if player not in self.points:
            return 0
        return self.points[player]

    def get_moves(self, player: Player) -> list[Article]:
        """Get the moves of a player."""
        if player not in self.moves:
            return []
        return self.moves[player].get_moves()

    def go_back(self, player: Player) -> None:
        """Go back one move for a player."""
        if player in self.moves:
            self.moves[player].go_back()

    def go_forward(self, player: Player) -> None:
        """Go forward one move for a player."""
        if player in self.moves:
            self.moves[player].go_forward()

    def get_current_article(self, player: Player) -> Article:
        """Get the current article of a player."""
        if player in self.moves:
            return self.moves[player].current.article
        return self.start_article


class PointsCounter:
    """Counts points for a single round."""

    def __init__(self, round_data: RoundData) -> None:
        self.round_data = round_data

    def set_new_round(self, round_data: RoundData) -> None:
        self.round_data = round_data

    def check_for_points_on_move(self, player: Player, article: Article) -> None:
        player_moves = [
            article.pretty_name for article in self.round_data.get_moves(player)]
        if article.pretty_name in self.round_data.get_articles_to_find_pretty_name() and article.pretty_name not in player_moves:
            if not self.round_data.points.get(player):
                self.round_data.points[player] = 0
            self.round_data.points[player] += 10
            logging.info(
                f"Player {player.name} found article {article.pretty_name} + 10 points")
            if article.pretty_name not in self.round_data.get_found_articles_pretty_name():
                self.round_data.points[player] += 5
                self.round_data.found_articles.add(article)
                logging.info(
                    f"Player {player.name} found article {article.pretty_name} + 5 points")


class RoundEndChecker:

    def check_for_end(self, player: Player, round_data: RoundData) -> bool:
        return set(article.pretty_name for article in round_data.get_moves(player)).issuperset(round_data.get_articles_to_find_pretty_name())


class PlayersHandler:

    players: dict[Player, PlayerData]

    players_offline: dict[Player, PlayerData]

    def __init__(self) -> None:
        self.players = {}
        self.players_offline = {}

    def add_player(self, player: Player, player_data: PlayerData) -> None:
        if player not in self.players and player not in self.players_offline:
            self.players[player] = player_data
        if self.players_offline.get(player):
            self.players[player] = self.players_offline[player]
            del self.players_offline[player]

    def get_player_data(self, player: Player) -> PlayerData | None:
        return self.players.get(player)

    def get_all_players_with_data(self):
        return self.players.items()

    def get_all_players(self):
        return self.players.keys()

    def go_offline(self, player: Player) -> None:
        player_data = self.players.get(player)
        if player_data:
            self.players_offline[player] = player_data
            del self.players[player]


class SearchGame(Game):
    """handles all the game related stuff"""

    state: State = State.idle

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

        if self.state == State.ingame:

            next_move = self.rounds[-1].get_current_article(player)
            Query.execute(
                move=next_move.url_name, recipient=player
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
        self.state = State.ingame

        self._round_timer()
        self.set_starting_position()

        self.rounds[-1].end_time = int(time.time()
                                       * 1000) + self.play_time * 1000

        return self._make_lobby_update_response()

    def go_to_lobby(self, host: Player) -> Response | None:
        if not self._check_host(host):
            return

        self.state = State.idle

        self.rounds.append(RoundData())
        self.points_counter.set_new_round(self.rounds[-1])

        return self._make_lobby_update_response()

    def _round_timer(self) -> None:
        async def update_state(round: int):
            sleep(self.play_time)
            if not (self.state == State.ingame and round == self.round):
                return
            self.state = State.over
            update_response = self._make_lobby_update_response()
            await manager.send_response(update_response)

        thread = Thread(target=asyncio.run, args=(
            update_state(round=self.round),))
        thread.start()

    def set_starting_position(self) -> None:
        for player in self.players_handler.get_all_players():
            Query.execute(
                move=self.rounds[-1].start_article.url_name, recipient=player)

    def _calculate_points_total(self, player: Player) -> int:
        points = 0
        for round in self.rounds:
            if round.points.get(player):
                points += round.points[player]
        return points

    def _make_lobby_update_response(self) -> LobbyUpdate:
        return LobbyUpdate(
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
            players=[
                (
                    PlayerCopy(
                        id=player.id, name=player.name,
                        points=self.rounds[-1].get_points(player),
                        points_current_round=self._calculate_points_total(
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

    def set_article(self, player: Player, url_name: str, better_name: str, description: str = "", start=False) -> Response:
        if not self._check_host(player):
            return Error(
                e="You are not the host",
                _recipients=[player]
            )

        url_name: str | None = url_name.split("#")[0]

        # url_name = Query.query_and_add_to_queries(url_name)
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
        if self.state != State.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )

        if not self._is_move_allowed(url_name=url_name, player=player):
            logging.warning("cheate detected/ or double click")
            # forcing player to reload to correct page
            return SyncMove(_recipients=[player], url_name=self.rounds[-1].get_current_article(player).url_name)

        # needs be after is move allowed otherwise links with # are not allowed bc they are not in the link list
        url_name = url_name.split("#")[0]

        logging.info("move to " + url_name)

        pretty_name = Query.execute(move=url_name, recipient=player)

        if pretty_name is None:
            logging.warning("move failed")
            return None

        article = Article(pretty_name=pretty_name, url_name=url_name)

        self.points_counter.check_for_points_on_move(player, article)

        self.rounds[-1].add_move(player, article)

        if self.round_end_checker.check_for_end(player, self.rounds[-1]):
            self.state = State.over

        return self._make_lobby_update_response()

    def page_back(self, player: Player):
        if self.state != State.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )

        self.rounds[-1].go_back(player)

        url_name = self.rounds[-1].get_current_article(player).url_name

        Query.execute(move=url_name,
                      recipient=player)
        return SyncMove(_recipients=[player], url_name=url_name)

    def page_forward(self, player: Player):
        if self.state != State.ingame:
            return Error(
                e="not ingame",
                _recipients=[player],
            )
        self.rounds[-1].go_forward(player)

        url_name = self.rounds[-1].get_current_article(player).url_name

        Query.execute(move=url_name,
                      recipient=player)
        return SyncMove(_recipients=[player], url_name=url_name)

    def _is_move_allowed(self, url_name: str, player: Player) -> bool:
        current_location = self.rounds[-1].get_current_article(player).url_name
        # links is a list of pretty names and the key of queries is the url name
        # WARNING pretty confusing WARNING

        return Query().is_link_allowed(current_location, url_name)
