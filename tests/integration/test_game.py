from game.Game import State
from game.PlayerData import PlayerRights, PlayerState
from game.Player import Player
from game.LobbyServer import LobbyServer


class TestStuff:
    host = Player()
    server = LobbyServer()
    server.new_lobby(player=host)
    lobby = server.player_lobbies.get(host)
    normal_player = Player()

    def test_create_lobby(self):
        assert self.server.player_lobbies.get(self.host) is not None
        assert self.host in self.server.player_lobbies[self.host].players

    def test_join_lobby(self):

        self.server.join_lobby(
            lobby=self.lobby,
            player=self.normal_player
        )

        assert self.normal_player in self.server.player_lobbies.get(self.normal_player).players

    def test_start_game(self):
        self.lobby.game.start(host=self.host)
        assert self.lobby.game.state != State.fleeing
        self.lobby.game.set_role(host=self.host, player=self.host, role=PlayerState.fleeing)
        self.lobby.game.set_role(host=self.host, player=self.normal_player, role=PlayerState.hunting)
        self.lobby.game.start(host=self.host)
        assert self.lobby.game.state == State.fleeing

        assert not self.lobby.game.points

        # not really an assertion for starting the game more for initializing the game
        assert self.lobby.game.players[self.host].rights == PlayerRights.host

    def test_move(self):
        self.lobby.game.state = State.finding
        self.lobby.game.move(self.host, target="test2")
        assert "test2" in self.lobby.game.players[self.host].moves
        assert "test2" not in self.lobby.game.players[self.normal_player].moves

    def test_forbidden_move(self):
        # TODO: dont do this here

        self.lobby.game.state = State.fleeing
        self.lobby.game.move(self.normal_player, target="test2")
        assert "test2" not in self.lobby.game.players[self.normal_player].moves


    def test_winning_condition(self):
        self.lobby.game.state = State.finding
        self.lobby.game.move(self.normal_player, target="test2")
        assert self.lobby.game.state == State.over
