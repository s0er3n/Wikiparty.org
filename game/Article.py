from dataclasses import dataclass


@dataclass(frozen=True)
class Article:
    url_name: str = ""
    pretty_name: str = ""
