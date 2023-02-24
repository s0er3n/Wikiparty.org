import logging
import requests
import concurrent.futures

import os
from dotenv import load_dotenv

load_dotenv()

URL = os.environ["LOGGING_SERVER_URL"]
DEV = os.environ.get("DEV", "False") == "True"
LOGGING_TOKEN = os.environ.get("LOGGING_SERVER_TOKEN")

formatter = logging.Formatter(
    '{"time": "%(asctime)s", "filename": "%(filename)s", "level": "%(levelname)s", "message": "%(message)s"}')


logging.basicConfig(level=logging.INFO)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)


class CustomHandler(logging.Handler):

    def emit(self, record):
        body = {"time": record.asctime, "log_level": record.levelname}
        executor.submit(requests.post, **{"url": URL,
                                          "json": body,
                                          "headers": {
                                              "Authorization": ("Bearer " + LOGGING_TOKEN),
                                              "Content-type": "application/x-ndjson"}})


logger = logging.getLogger()

if DEV:
    console_log = logging.StreamHandler()
    console_log.setFormatter(formatter)
    logger.addHandler(console_log)

if not DEV:
    httpHandler = CustomHandler()
    httpHandler.setFormatter(formatter)
    logger.addHandler(httpHandler)
