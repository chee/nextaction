import {createSignal} from "solid-js"
import type {SelectionContext} from "@/infra/hooks/selection-context.ts"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {debounce} from "radash"
import type {ExpandableProps} from "../../ui/components/actions/action.tsx"
import {createEffect} from "solid-js"

export function useExpander<T extends AutomergeUrl>(
	selection: SelectionContext
) {
	const [expanded, setExpanded] = createSignal<T>()

	createEffect(() => {
		const selected = selection.selected()
		const url = expanded()
		if (selected.length && url && !selected.includes(url)) {
			setExpanded()
		}
	})
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

export type Expander<T extends AutomergeUrl> = ReturnType<typeof useExpander<T>>

export function useRecentlyRemoved<T extends AutomergeUrl = AutomergeUrl>(
	delay = 2400
) {
	const [recentlyRemoved, setRecentlyRemoved] = createSignal<T[]>([])
	const clear = debounce({delay}, () => setRecentlyRemoved([]))
	const hold = (url: T) => {
		setRecentlyRemoved(recentlyRemoved().concat(url))
		clear()
	}
	const runAndHold = (fn: () => void, url: T) => {
		fn()
		hold(url)
	}
	// eslint-disable-next-line solid/reactivity
	return [(url: T) => recentlyRemoved().includes(url), runAndHold] as const
}
