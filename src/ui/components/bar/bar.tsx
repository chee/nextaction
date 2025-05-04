import "./bar.css"
import type {JSX} from "solid-js"
import {Button, type ButtonRootProps} from "@kobalte/core/button"
import type {PolymorphicProps} from "@kobalte/core"
import {DropdownMenu} from "@kobalte/core/dropdown-menu"
import BigPlus from "@/ui/icons/big-plus.tsx"
import type {SelectionContext} from "../../../infra/hooks/selection-context.ts"
import type {ActionURL} from "../../../domain/action.ts"

export default function Bar(props: {children?: JSX.Element}) {
	return <nav class="bar">{props.children}</nav>
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

export function BarMenu() {
	return (
		<DropdownMenu>
			<DropdownMenu.Trigger class="bar-button">
				<span class="bar-button__icon">
					<svg>
						<path
							d="M3 8h18M3 14h18M3 20h18m"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
				<span class="bar-button__label">Menu</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content class="popmenu">
					<DropdownMenu.Item class="popmenu__item">
						Commit <div class="dropdown-menu__item-right-slot">⌘+K</div>
					</DropdownMenu.Item>
					<DropdownMenu.Item class="dropdown-menu__item">
						Push <div class="dropdown-menu__item-right-slot">⇧+⌘+K</div>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu>
	)
}

export function BarNewAction(props: {newAction: () => void}) {
	return (
		<BarButton
			icon={<BigPlus />}
			label="new action"
			onClick={props.newAction}
		/>
	)
}
