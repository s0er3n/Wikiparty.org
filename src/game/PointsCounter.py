from src.game.RoundData import RoundData
from src.game.Player.Player import Player
from src.game.Article import Article
from src.game.settings.logsetup import logger


class PointsCounter:
    """Counts points for a single round."""

    def __init__(self, round_data: RoundData) -> None:
        self.round_data = round_data

    def set_new_round(self, round_data: RoundData) -> None:
        self.round_data = round_data

    def check_for_points_on_move(self, player: Player, article: Article) -> None:
        player_moves = [
            article.pretty_name for article in self.round_data.get_moves(player)
        ]
        if (
            article.pretty_name in self.round_data.get_articles_to_find_pretty_name()
            and article.pretty_name not in player_moves
        ):
            if not self.round_data.points.get(player):
                self.round_data.points[player] = 0
            self.round_data.points[player] += 10
            logger.info(
                f"Player {player.name} found article {article.pretty_name} + 10 points"
            )
            if (
                article.pretty_name
                not in self.round_data.get_found_articles_pretty_name()
            ):
                self.round_data.points[player] += 5
                self.round_data.found_articles.add(article)
                logger.info(
                    f"Player {player.name} found article {article.pretty_name} + 5 points"
                )
