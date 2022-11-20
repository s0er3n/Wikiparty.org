import dataclasses
from enum import Enum


class PlayerRights(str, Enum):
    host = "host"
    normal = "normal"


class PlayerState(str, Enum):
    hunting = "hunting"
    fleeing = "fleeing"
    catched = "catched"
    watching = "watching"


@dataclasses.dataclass
class PlayerData:
    rights: PlayerRights

    state: PlayerState = PlayerState.watching

    moves: list[str] = dataclasses.field(
        default_factory=list
    )
