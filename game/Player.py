import dataclasses
import uuid


@dataclasses.dataclass(frozen=True)
class Player:

    id: str
    name: str = "unnamed player"

    @staticmethod
    def set_user_name(player, name: str):
        player.name = name
