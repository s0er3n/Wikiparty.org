from src.game.Player.Player import Player
from src.game.Moves import Moves
from src.game.Article import Article
from src.game.Player.PlayerData import Node

from dataclasses import dataclass, field
from collections import defaultdict


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
        return {
            article.pretty_name: article.description
            for article in self.articles_to_find
        }

    def get_found_articles_pretty_name(self) -> set[str]:
        return set(article.pretty_name for article in self.found_articles)

    def add_move(self, player: Player, article: Article):
        """Add a move to the round data."""
        if player not in self.moves:
            start_node = Node(self.start_article, parent=None)
            new_node = start_node.add_child(article)
            self.moves[player] = Moves(start_node, new_node)
        else:
            self.moves[player].current = self.moves[player].current.add_child(article)

    def get_current_points(self, player: Player) -> int:
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
