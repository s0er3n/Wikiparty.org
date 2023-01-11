from __future__ import annotations
import logging

import dataclasses
from enum import Enum

from game.Article import Article


class PlayerRights(str, Enum):
    host = "host"
    normal = "normal"


class PlayerState(str, Enum):
    hunting = "hunting"
    watching = "watching"
    finnished = "finnished"


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
        logging.warning("sorted_moves_list got object None")
        return []
    if res is None:
        res = []
    print("rec parent")
    print(node)
    print(node.children)
    res.append(node)
    if not node.children:
        return res
    for child in node.children:
        print("rec child")
        print(child)
        print(child.children)
        if child not in res:
            res = sorted_moves_list(child, res=res)
    return res


@dataclasses.dataclass
class PlayerData:
    rights: PlayerRights
    state: PlayerState = PlayerState.watching
    node_position: Node | None = None
    start_node: Node | None = None


@dataclasses.dataclass
class PlayerDataNoNode:
    rights: PlayerRights
    state: PlayerState = PlayerState.watching
    moves: list[Article] = dataclasses.field(default_factory=list)
