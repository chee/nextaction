import "./checkbox.css"
import type {ActionViewModel} from "@/viewmodel/action.ts"
import bemby from "bemby"
import {modshift} from "@/infra/lib/hotkeys.ts"
import {Show, Switch} from "solid-js"
import {Match} from "solid-js"
import {ContextMenu} from "@kobalte/core/context-menu"

function Tick() {
	return (
		<svg
			class="checkbox__indicator"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round">
			<path d="M20 6L9 17l-5-5" />
		</svg>
	)
}

function Cross() {
	return (
		<svg
			class="checkbox__indicator"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	)
}

export default function Checkbox(props: ActionViewModel) {
	const closed = () => ["canceled", "completed"].includes(props.state)
	return (
		<ContextMenu>
			<ContextMenu.Trigger>
				<div
					class={bemby("checkbox", props.state, {
						closed: closed(),
						someday: props.when == "someday",
					})}
					role="radiogroup"
					onClick={event => {
						if (event.altKey) {
							props.toggleCanceled(!closed())
						} else if (!modshift(event)) {
							props.toggleCompleted(!closed())
						}
					}}
					onDblClick={event => {
						event.stopImmediatePropagation()
						event.stopPropagation()
						event.preventDefault()
					}}>
					<Switch>
						<Match when={props.state == "completed"}>
							<Tick />
						</Match>
						<Match when={props.state == "canceled"}>
							<Cross />
						</Match>
						<Match when={props.state == "doing"}>
							<svg
								class="checkbox__indicator"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path d="M6 6h12v12H6z" />
							</svg>
						</Match>
						<Match when={props.state == "awaiting"}>
							<svg
								class="checkbox__indicator"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round">
								<path d="M6 6h12v12H6z" />
								<path d="M6 12h12" />
							</svg>
						</Match>
					</Switch>
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Portal>
				<ContextMenu.Content class="popmenu">
					<ContextMenu.Item
						class="popmenu__item"
						closeOnSelect
						onSelect={() => props.toggleCompleted()}>
						Mark as{" "}
						<Show when={props.state == "completed"} fallback="complete">
							incomplete
						</Show>
					</ContextMenu.Item>
					<ContextMenu.Item
						class="popmenu__item"
						closeOnSelect
						onSelect={() => props.toggleCanceled()}>
						Mark as{" "}
						<Show when={props.state == "canceled"} fallback="canceled">
							incomplete
						</Show>
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu>
	)
}
