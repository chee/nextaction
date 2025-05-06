import type {BembyModifier} from "bemby"
import bemby from "bemby"
import {type JSX} from "solid-js"

export default function Page(props: {
	modifiers: BembyModifier
	title: JSX.Element
	children: JSX.Element
}) {
	return (
		<div class={bemby("page-container", props.modifiers)}>
			<article class={bemby("page", props.modifiers)}>
				<h1 class={bemby("page-title", props.modifiers)}>{props.title}</h1>
				<main class={bemby("page-content", props.modifiers)}>
					{props.children}
				</main>
			</article>
		</div>
	)
}
