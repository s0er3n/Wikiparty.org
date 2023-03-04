from __future__ import annotations
from game.settings.logsetup import logger

import dataclasses
from enum import Enum

from game.Article import Article


class PlayerRights(str, Enum):
    host = "host"
    normal = "normal"


@dataclasses.dataclass
class Node:
    article: Article
    parent: Node | None
    children: list[Node] = dataclasses.field(default_factory=list)

    def add_child(self, article: Article) -> Node:
        new_node = Node(
            article=article, parent=self
        )
        self.children.append(new_node)
        return new_node


def sorted_moves_list(node: Node, res: list | None = None) -> list[Node]:
    if node is None:
        logger.info("sorted_moves_list got object None")
        return []
    if res is None:
        res = []
    if int(id(node)) not in [int(id(n2)) for n2 in res]:
        res.append(node)
    for child in node.children:
        if int(id(child)) not in [int(id(n2)) for n2 in res]:
            sorted_moves_list(child, res=res)
    return res


@dataclasses.dataclass
class PlayerData:
    rights: PlayerRights


@dataclasses.dataclass
class PlayerDataNoNode:
    current_position: str
    rights: PlayerRights
    moves: list[Article] = dataclasses.field(default_factory=list)