import { Component, For } from "solid-js";

const PlayerList: Component<{ players: any }> = (props) => {
  return (
    <ul>
      <For each={props.players ?? []}>
        {(player: any, i) => (
          <li>
            <span class="font-bold">{player[0].name}</span>
            <span class="ml-2">{JSON.stringify(player[0].points ?? 0)}</span>
          </li>
        )}
      </For>
    </ul>
  );
};

export default PlayerList;
