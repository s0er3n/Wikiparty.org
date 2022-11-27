from enum import Enum


class State(Enum):
    idle = "idle"
    fleeing = "fleeing"
    finding = "finding"
    over = "over"
