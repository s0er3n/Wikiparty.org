import redis

import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["redis_url"]

client = redis.from_url(url)
