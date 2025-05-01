import {
	createContext,
	createSignal,
	getOwner,
	runWithOwner,
	useContext,
} from "solid-js"
import type {ActionURL} from "../../domain/action.ts"
import type {SelectionContext} from "../../infra/hooks/selection-context.ts"

export const PageContext = createContext<PageContext>()

// todo a shared Page interface that has things like
// • selection
// • expanded?
// • expand/collapse
// • drag/drop
// • newAction
export type PageContext = {
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
