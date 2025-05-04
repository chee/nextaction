import type {Accessor} from "solid-js"
import {createSignal} from "solid-js"

export type SelectionDropTarget = {url: string; abovebelow?: "above" | "below"}

export interface SelectionContext<S extends string = string> {
	/** kept in the same order as the allItems */
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
}

// todo and .itemBeforeSelection and .itemAfterSelection
// todo this should have .selectPrevious and .selectNext
// todo and .moveSelectionUp and .moveSelectionDown
// todo this is probably a viewmodel(mixin?)
export function createSelectionContext<S extends string = string>(
	allItems: Accessor<S[]>
): SelectionContext<S> {
	const [selectedItems, setSelectedItems] = createSignal<S[]>([])

	return {
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
	}
}
