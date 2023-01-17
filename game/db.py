import redis

import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ["REDIS_URL"]

client = redis.from_url(url)
