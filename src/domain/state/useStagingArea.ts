import type {AnyChildType, ConceptURLMap} from ":concepts:"
import {createSignal} from "solid-js"
import {debounce} from "radash"

export function useStagingArea<C extends AnyChildType>(delay = 2400) {
	type T = ConceptURLMap[C]
	const [staged, setStaged] = createSignal<T[]>([])
	const clear = debounce({delay}, () => setStaged([]))
	const hold = (url: T) => {
		setStaged(staged().concat(url))
		clear()
	}
	const stage = (fn: () => void, url: T) => {
		fn()
		hold(url)
	}
	// [isStaged, stage]
	return [(url: T) => staged().includes(url), stage] as const
}
