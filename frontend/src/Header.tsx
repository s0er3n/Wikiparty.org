import { Accessor, Component, Show } from "solid-js";

const Header: Component<{ lobby: Accessor<{ id: string }> }> = (props) => {
  return (
    <div class="navbar bg-base-100 top-0 sticky bg-slate-500 z-50">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">Better WikiGame</a>
      </div>
      <Show when={props.lobby()}>
        <div class="flex-none space-x-2 ">
          <input
            class="hidden md:block input input-bordered"
            onclick={async () => {
              await navigator.clipboard.writeText(props.lobby().id);
            }}
            value={props.lobby().id}
            readonly
          ></input>
          <button
            onclick={async () => {
              await navigator.clipboard.writeText(props.lobby().id);
            }}
            class="btn"
          >
            copy
          </button>
        </div>
      </Show>
    </div>
  );
};

export default Header;
