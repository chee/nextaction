import type {ConceptURLMap} from ":concepts:"
import type {Selection} from "./useSelection.ts"
import {createSignal} from "solid-js"

export type ExpandableProps = {
	expanded: boolean
	expand(): void
	collapse(): void
}

export type ExpandableConcept = "action" | "heading"

export function useExpander<C extends ExpandableConcept>(selection: Selection) {
	type T = ConceptURLMap[C]
	const [expanded, setExpanded] = createSignal<T>()

	return {
		isExpanded: (url: T) => expanded() == url,
		expanded,
		expand(url: T) {
			setExpanded(() => url)
			selection.clearSelected()
		},
		collapse() {
			const url = expanded()
			setExpanded()
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			url && selection.select(url)
		},
		props(url: T): ExpandableProps {
			return {
				expanded: expanded() == url,
				expand: () => setExpanded(() => url),
				collapse: () => setExpanded(),
			}
		},
	}
}

export type Expander<C extends ExpandableConcept> = ReturnType<
	typeof useExpander<C>
>
