import logging
import requests
import concurrent.futures

import os
from dotenv import load_dotenv

load_dotenv()

URL = os.environ["LOGGING_SERVER_URL"]
DEV = os.environ.get("DEV", False)

formatter = logging.Formatter(
    '{"time": "%(asctime)s", "filename": "%(filename)s", "level": "%(levelname)s", "message": "%(message)s"}')


logging.basicConfig(level=logging.INFO)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)


class CustomHandler(logging.Handler):

    def emit(self, record):
        log_entry = self.format(record).encode('utf-8')
        requests.post(URL, log_entry, headers={
                      "Content-type": "application/json"}).content
        executor.submit(requests.post, [], {"url": URL,
                                            "log_entry": log_entry,
                                            "headers": {
                                                "Content-type": "application/json"}})


logger = logging.getLogger()

if DEV:
    console_log = logging.StreamHandler()
    console_log.setFormatter(formatter)
    logger.addHandler(console_log)

if not DEV:
    httpHandler = CustomHandler()
    httpHandler.setFormatter(formatter)
    logger.addHandler(httpHandler)
