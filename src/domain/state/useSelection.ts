import type {Accessor} from "solid-js"
import {createSignal} from "solid-js"

export interface Selection<S extends string = string> {
	all(): S[]
	selected(): S[]
	select(target: S): void
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
	itemBeforeSelection(): S | undefined
	itemAfterSelection(): S | undefined
	selectAll(): void
}

export function createSelectionContext<S extends string = string>(
	allItems: Accessor<S[]>
): Selection<S> {
	const [selectedItems, setSelectedItems] = createSignal<S[]>([])

	return {
		all() {
			return allItems()
		},
		selectAll() {
			setSelectedItems(allItems())
		},
		select(id) {
			setSelectedItems([id])
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
				const start = Math.min(index, prev[0] ? all.indexOf(prev[0]) : 0)
				const end = Math.max(index, prev[0] ? all.indexOf(prev[0]) : 0)
				return all.slice(start, end + 1)
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
}

export function getSelectionProps<T extends string>(
	selection: Selection,
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
