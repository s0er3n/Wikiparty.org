from game.Player import Player
import requests
from game.ConnectionManager import manager
from game.Response import Response, Wiki
import asyncio
from threading import Thread
# from collections import defaultdict

class Query:
    # i will query one by one for MVP
    # next_query: dict[str, list[Player]] = defaultdict(list)

    @staticmethod
    def execute(move: str, recipient: Player):
        # self.next_query[move].apend(recipient)
        r = requests.get(f"https://en.wikipedia.org/w/api.php?action=parse&page={move}&format=json")
        data = r.json()
        

        thread = Thread(target=asyncio.run, args=(manager.send_response(
                                                      Response(method="move", data=Wiki(data=data["parse"]["text"]["*"]), recipients=[recipient])
                )
        ,))
        thread.start()


        

