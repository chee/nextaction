import "../layouts/chrome.css"

import Bar, {BarNewAction} from "@/ui/components/bar/bar.tsx"
import {clsx} from "@nberlette/clsx"
import type {JSX} from "solid-js"

export default function Page(props: {
	name: string
	title: JSX.Element
	children?: JSX.Element
}) {
	return (
		<div class={clsx(props.name, "page-container")}>
			<Bar>
				<BarNewAction />
			</Bar>
			<div class="page">
				<h1 class="page-title">{props.title}</h1>
				<main class="page-content">{props.children}</main>
			</div>
		</div>
	)
}
