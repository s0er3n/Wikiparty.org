import { Accessor, Component, Show } from "solid-js";

const Header: Component<{ lobby: Accessor<{ id: string }> }> = (props) => {
  return (
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">Better WikiGame</a>
      </div>
      <Show
        when={props.lobby()}
      >
        <div class="flex-none space-x-2">

          <input onclick={async () => {
            await navigator.clipboard.writeText(props.lobby().id)
          }} class='input input-bordered' value={props.lobby().id} readonly></input><button onclick={async () => {
            await navigator.clipboard.writeText(props.lobby().id)
          }} class="btn">copy</button>

        </div>
      </Show>
    </div>
  )
}

export default Header
