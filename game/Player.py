import dataclasses
import uuid

@dataclasses.dataclass(frozen=True)
class Player:

    id: str
    name: str = "unnamed player"
