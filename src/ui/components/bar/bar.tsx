import type { JSX } from "solid-js"
import "./bar.css"
import { Button, type ButtonRootProps } from "@kobalte/core/button"
import type { PolymorphicProps } from "@kobalte/core"
export default function Bar(props: { children?: JSX.Element }) {
	return <nav class="bar">{props.children}</nav>
}

export function BarButton(
	props: PolymorphicProps<"button", ButtonRootProps<HTMLButtonElement>> & {
		icon?: JSX.Element
		label: string
	},
) {
	return (
		<Button class="bar-button" {...props}>
			<span class="bar-button__icon">{props.icon}</span>
			<span class="bar-button__label">{props.label}</span>
		</Button>
	)
}
