import dataclasses


class Player:
    name: str = "unnamed player"

    def __str__(self):
        return self.name

