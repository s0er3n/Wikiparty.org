from game.Article import Article
from game.Player.PlayerData import Node, sorted_moves_list

from dataclasses import dataclass


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
