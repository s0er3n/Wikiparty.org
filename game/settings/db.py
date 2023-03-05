import redis

import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["REDIS_URL"]

client = redis.from_url(url)


def get_article(move: str, language: str) -> bytes | None:
    return client.get(f"article:{language}:" + move)
