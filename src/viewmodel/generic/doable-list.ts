import {useRecentlyRemoved} from "./page.ts"
import type {AnyDoableViewModel} from "./doable.ts"
import {mapArray} from "solid-js"

export function useDoableListContext<Model extends AnyDoableViewModel>(
	items: () => Model[]
) {
	const {
		recentlyRemoved: recentlyClosed,
		toggleItemCanceled,
		toggleItemComplete,
	} = useRecentlyRemoved()
	const urls = mapArray(items, item => item.url)

	return {
		toggleItemCanceled,
		toggleItemComplete,
		get items() {
			return items() as Model[]
		},
		get itemURLs() {
			return urls()
		},
		get visibleItems() {
			return this.items.filter(
				item =>
					(!item.closed && !item.deleted) || recentlyClosed().includes(item.url)
			)
		},
		get visibleItemURLs() {
			return this.visibleItems.map(item => item.url)
		},
		get loggedItems() {
			return this.items.filter(item => item.closed)
		},
		get loggedItemURLs() {
			return this.loggedItems.map(item => item.url)
		},
	}
}

export type DoableListContext = ReturnType<typeof useDoableListContext>
