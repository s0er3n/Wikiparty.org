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
class PlayerData:
    rights: PlayerRights

    state: PlayerState = PlayerState.watching

    moves: list[Article] = dataclasses.field(default_factory=list)
