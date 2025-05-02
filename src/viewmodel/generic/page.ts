import {createContext, createSignal, useContext, getOwner} from "solid-js"
import type {ActionURL} from "../../domain/action.ts"
import type {SelectionContext} from "../../infra/hooks/selection-context.ts"
import type {ActionViewModel} from "../action.ts"
import type {ProjectViewModel} from "../project.ts"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {AnyItemViewModel} from "./useviewmodel.ts"
import {debounce} from "radash"

export const PageContext = createContext<PageContext>()

export type PageContext<ItemType extends AnyItemViewModel = AnyItemViewModel> =
	{
		selection: SelectionContext
		isExpanded(url: ActionURL): boolean
		expanded(): ActionURL | undefined
		expand(url: ActionURL): void
		collapse(): void
		newAction(index?: number): ActionURL
		createDraggable(
			element: HTMLElement,
			itemViewModel: {type: string; url: string}
		): undefined | (() => void)
		createDropTarget(
			element: HTMLElement,
			itemViewModel: {type: string; url: string}
		): (() => void) | undefined
		// todo maybe these should stake a URL or ref, not a view model
		// these are for recently closed items
		toggleItemComplete(
			item: ActionViewModel | ProjectViewModel,
			force?: boolean
		): void
		toggleItemCanceled(
			item: ActionViewModel | ProjectViewModel,
			force?: boolean
		): void
		items: ItemType[]
	}

export function usePageContext() {
	const context = useContext(PageContext)
	if (!context) {
		throw new Error("usePageContext must be used within a PageProvider")
	}
	return context
}

export function useExpandedAction(selection: SelectionContext) {
	const [expanded, setExpanded] = createSignal<ActionURL>()
	return {
		isExpanded: (url: ActionURL) => expanded() == url,
		expanded,
		expand(url: ActionURL) {
			setExpanded(url)
			selection.clearSelected()
		},
		collapse() {
			const url = expanded()
			setExpanded()
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			url && selection.select(url)
		},
	}
}

export function useRecentlyRemoved() {
	const [recentlyRemoved, setRecentlyRemoved] = createSignal<AutomergeUrl[]>([])
	const clear = debounce({delay: 2400}, () => setRecentlyRemoved([]))
	const hold = (url: AutomergeUrl) => {
		setRecentlyRemoved(recentlyRemoved().concat(url))
		clear()
	}

	return {
		recentlyRemoved,
		toggleItemCanceled(
			item: {toggleCanceled: (force?: boolean) => void; url: AutomergeUrl},
			force?: boolean
		) {
			item.toggleCanceled(force)
			hold(item.url)
		},
		toggleItemComplete(
			item: {toggleCompleted: (force?: boolean) => void; url: AutomergeUrl},
			force?: boolean
		) {
			item.toggleCompleted(force)
			hold(item.url)
		},
		toggleHeadingArchived(
			item: {toggleArchived: (force?: boolean) => void; url: AutomergeUrl},
			force?: boolean
		) {
			item.toggleArchived(force)
			hold(item.url)
		},
	}
}
