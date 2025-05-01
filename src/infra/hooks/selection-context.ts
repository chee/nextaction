import type {Accessor} from "solid-js"
import {createSignal} from "solid-js"

export type SelectionDropTarget = {url: string; abovebelow?: "above" | "below"}

export interface SelectionContext {
	/** kept in the same order as the allItems */
	selected(): string[]
	select(target: string): void
	addSelected(target: string): void
	isSelected(target: string): boolean
	/**
	 * select between the closest currently selected index and the target,
	 * in either direction */
	addSelectedRange(target: string): void
	removeSelected(target: string): void
	clearSelected(): void

	startDrag(target: string): void
	// performs the drag, mutating an array to match the new order
	completeDrag(): string[]
	endDrag(): void
	dragged(): string[]
	dragTarget(): string
	setDropTarget(target: SelectionDropTarget | undefined): void
	dropTarget(): SelectionDropTarget | undefined
	lastSelectedIndex(): number
	// todo add visual top and bottom selected index
	displayed(): string[]
}

// todo and .itemBeforeSelection and .itemAfterSelection
// todo this should have .selectPrevious and .selectNext
// todo and .moveSelectionUp and .moveSelectionDown
// todo this is probably a viewmodel(mixin?)
export function createSelectionContext(
	allItems: Accessor<string[] | undefined>
): SelectionContext {
	const [dragging, setDragging] = createSignal(false)
	const [selectedItems, setSelectedItems] = createSignal<string[]>([])
	const dragged = () => (dragging() ? selectedItems() : [])
	const displayed = () => {
		const all = allItems()
		const selected = selectedItems()
		if (!all) return []
		if (!dragging()) return all

		return all.filter(item => !selected.includes(item))
	}
	const [dragTarget, setDragTarget] = createSignal<string>("")
	const [dropTarget, setDropTarget] = createSignal<SelectionDropTarget>()

	return {
		displayed,
		select(id) {
			setSelectedItems([id])
		},
		isSelected(id) {
			return selectedItems().includes(id)
		},
		addSelected(id) {
			setSelectedItems(prev => {
				if (prev.includes(id)) return prev
				return [...prev, id]
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
		dragged,
		startDrag(id) {
			if (!this.selected()?.includes(id)) {
				this.select(id)
			}
			setDragging(true)
			setDragTarget(id)
		},
		dragTarget: dragTarget,
		completeDrag() {
			const dragged = [...this.dragged()]
			this.endDrag()
			return dragged
		},
		endDrag() {
			setDragging(false)
			setDragTarget("")
		},
		setDropTarget,
		dropTarget: () => dropTarget(),
		// todo topSelectedIndex and bottomSelectedIndex
		lastSelectedIndex() {
			const all = allItems()
			if (!all) return -1
			const selected = selectedItems()
			if (selected.length === 0) return -1
			return all.indexOf(selected[selected.length - 1])
		},
	}
}
