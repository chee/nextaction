import type {Accessor} from "solid-js"
import {createContext} from "solid-js"
import {createSignal} from "solid-js"
import {AnyChildURL} from ":concepts:"
import {useContext} from "solid-js"

export interface SelectionContext<S extends string = string> {
	all(): S[]
	selected(): S[]
	select(target: S | S[]): void
	addSelected(target: S): void
	isSelected(target: S): boolean
	/**
	 * select between the closest currently selected index and the target,
	 * in either direction */
	addSelectedRange(target: S): void
	removeSelected(target: S): void
	clearSelected(): void
	lastSelected(): S
	lastSelectedIndex(): number
	topSelectedIndex(): number
	bottomSelectedIndex(): number
	topSelected(): S | undefined
	bottomSelected(): S | undefined
	itemBeforeSelection(): S | undefined
	itemAfterSelection(): S | undefined
	selectAll(): void
}

export const GlobalSelectionContext = createContext<{
	selection: SelectionContext<AnyChildURL>
	setSelectionContext: (selection: SelectionContext<AnyChildURL>) => void
}>()

export function useGlobalSelectionContext() {
	const context = useContext(GlobalSelectionContext)
	if (!context) {
		throw new Error(
			"useGlobalSelectionContext must be used within a GlobalSelectionProvider"
		)
	}
	return context.selection
}

export function setGlobalSelection(s: SelectionContext<AnyChildURL>) {
	const context = useContext(GlobalSelectionContext)
	context?.setSelectionContext(s)
}

export function createSelectionContext<S extends AnyChildURL = AnyChildURL>(
	allItems: Accessor<S[]>
): SelectionContext<S> {
	const [selectedItems, setSelectedItems] = createSignal<S[]>([])

	const selection: SelectionContext<S> = {
		all() {
			return allItems()
		},
		selectAll() {
			setSelectedItems(allItems())
		},
		select(id) {
			setSelectedItems(Array.isArray(id) ? id : [id])
		},
		isSelected(id) {
			return selectedItems().includes(id)
		},
		addSelected(id) {
			setSelectedItems(prev => {
				if (prev.includes(id)) return prev
				return [...new Set([...prev, id])]
			})
		},
		addSelectedRange(id) {
			setSelectedItems(prev => {
				if (prev.includes(id)) return prev
				const all = allItems()
				if (!all) return prev
				const index = all.indexOf(id)
				if (index === -1) return prev
				const selected = new Set(prev)
				const start = Math.min(index, prev[0] ? all.indexOf(prev[0]) : 0)
				const end = Math.max(index, prev[0] ? all.indexOf(prev[0]) : 0)
				return [...selected.union(new Set(all.slice(start, end + 1)))]
			})
		},
		removeSelected(id) {
			setSelectedItems(prev => {
				const index = prev.indexOf(id)
				if (index === -1) return prev
				return [...prev.slice(0, index), ...prev.slice(index + 1)]
			})
		},
		clearSelected() {
			setSelectedItems([])
		},
		selected: selectedItems,
		lastSelected() {
			return this.selected()[this.selected().length - 1]
		},
		lastSelectedIndex() {
			const all = allItems()
			if (!all) return -1
			const selected = selectedItems()
			if (selected.length === 0) return -1
			return all.indexOf(this.lastSelected())
		},
		topSelectedIndex() {
			return Math.max(
				Math.min(...this.selected().map(url => allItems()?.indexOf(url) ?? 0)),
				0
			)
		},
		bottomSelectedIndex() {
			return Math.min(
				Math.max(...this.selected().map(url => allItems()?.indexOf(url) ?? 0)),
				allItems()?.length ?? 0
			)
		},
		topSelected() {
			return this.all()[this.topSelectedIndex()]
		},
		bottomSelected() {
			return this.all()[this.bottomSelectedIndex()]
		},
		itemBeforeSelection() {
			const all = allItems()
			if (!all) return undefined
			const index = this.topSelectedIndex()
			if (index === 0) return undefined
			return all[index - 1]
		},
		itemAfterSelection() {
			const all = allItems()
			if (!all) return undefined
			const index = this.bottomSelectedIndex()
			if (index === all.length - 1) return undefined
			return all[index + 1]
		},
	}

	// hack
	const global = useContext(GlobalSelectionContext)
	if (global) {
		global.setSelectionContext(selection)
	}

	return selection
}

export function getSelectionProps<T extends string>(
	selection: SelectionContext,
	url: T
): SelectableProps {
	return {
		selected: selection.isSelected(url),
		addSelected: () => selection.addSelected(url),
		addSelectedRange: () => selection.addSelectedRange(url),
		removeSelected: () => selection.removeSelected(url),
		select: () => selection.select(url),
	}
}

export type SelectableProps = {
	selected: boolean
	select(): void
	addSelected(): void
	addSelectedRange(): void
	removeSelected(): void
}
