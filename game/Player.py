import dataclasses
import uuid
def make_id():
    return str(uuid.uuid4())

@dataclasses.dataclass(frozen=True)
class Player:

    name: str = "unnamed player"
    id: str = dataclasses.field(
        default_factory=make_id
    )

