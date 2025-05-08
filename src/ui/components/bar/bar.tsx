import "./bar.css"
import type {JSX} from "solid-js"
import {Button, type ButtonRootProps} from "@kobalte/core/button"
import type {PolymorphicProps} from "@kobalte/core"
import BigPlus from "::ui/icons/big-plus.tsx"
import bemby, {type BembyModifier} from "bemby"
import {Show} from "solid-js"
import {
	redo,
	undo,
	useCommandRegistry,
} from "::viewmodels/commands/commands.tsx"
import {useHotkeys} from "../../hotkeys/useHotkeys.ts"
export default function Bar(props: {modifiers?: BembyModifier}) {
	const commandRegistry = useCommandRegistry()

	useHotkeys(
		"space",
		event => {
			if (event.target instanceof HTMLButtonElement) {
				// don't trigger the space key if the button is focused
				return
			}
			event.preventDefault()
			commandRegistry.exe("new-action")
		},
		{preventDefault: () => false}
	)

	useHotkeys("ctrl+shift+n", event => {
		commandRegistry.exe("new-action")
	})
	useHotkeys("backspace", () => {
		commandRegistry.exe("delete")
	})
	useHotkeys("cmd+ctrl+h", () => {
		commandRegistry.exe("new-heading")
	})
	useHotkeys("cmd+k", () => {
		commandRegistry.exe("complete")
	})
	useHotkeys("cmd+alt+k", () => {
		commandRegistry.exe("cancel")
	})
	useHotkeys("cmd+z", () => {
		undo()
	})
	useHotkeys("cmd+shift+z", () => {
		redo()
	})

	return (
		<nav class={bemby("bar", props.modifiers)}>
			<Show when={commandRegistry.has("delete")}>
				<Button
					class="button"
					aria-label="Delete item"
					onClick={() => {
						commandRegistry.exe("delete")
					}}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon"
						viewBox="0 0 24 24">
						<g fill="none" stroke="currentColor" stroke-width="1.5">
							<path
								stroke-linecap="round"
								d="M20.5 6h-17m15.333 2.5l-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81c-.865-.809-.954-2.136-1.13-4.79l-.46-6.9"
							/>
							<path d="M6.5 6h.11a2 2 0 0 0 1.83-1.32l.034-.103l.097-.291c.083-.249.125-.373.18-.479a1.5 1.5 0 0 1 1.094-.788C9.962 3 10.093 3 10.355 3h3.29c.262 0 .393 0 .51.019a1.5 1.5 0 0 1 1.094.788c.055.106.097.23.18.479l.097.291A2 2 0 0 0 17.5 6" />
						</g>
					</svg>
				</Button>
			</Show>
			<Show when={commandRegistry.has("schedule")}>
				<Button
					class="button"
					aria-label="schedule item"
					onClick={() => {
						commandRegistry.exe("schedule")
					}}>
					<svg viewBox="0 0 24 24" class="icon">
						<g fill="none">
							<path
								stroke="currentColor"
								stroke-width="1.5"
								d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z"
							/>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="1.5"
								d="M7 4V2.5M17 4V2.5M2.5 9h19"
							/>
							<path
								fill="currentColor"
								d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
							/>
						</g>
					</svg>
				</Button>
			</Show>
			<Show when={commandRegistry.has("new-heading")}>
				<Button
					class="button"
					aria-label="New Heading"
					onClick={() => {
						commandRegistry.exe("new-heading")
					}}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="icon"
						viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M18 4h1V2H5v2zm3 3.5H3v-2h18zM23 9v13H1V9zm-2 2H3v9h18z"
						/>
					</svg>
				</Button>
			</Show>
			<Show when={commandRegistry.has("new-action")}>
				<Button
					class="button"
					aria-label="New action"
					aria-keyshortcuts="space"
					onClick={() => {
						commandRegistry.exe("new-action")
					}}>
					<BigPlus />
				</Button>
			</Show>
		</nav>
	)
}

export function BarButton(
	props: PolymorphicProps<"button", ButtonRootProps<HTMLButtonElement>> & {
		icon?: JSX.Element
		label: string
	}
) {
	return (
		<Button class="bar-button" {...props}>
			<span class="bar-button__icon">{props.icon}</span>
			<span class="bar-button__label">{props.label}</span>
		</Button>
	)
}
