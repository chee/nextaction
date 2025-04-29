import type {Accessor} from "solid-js"
import {createSignal} from "solid-js"
import {createMemo} from "solid-js"

export interface ListContext {
	/** kept in the same order as the allItems */
	selected(): string[]
	select(target: string): void
	add(target: string): void
	/**
	 * select between the closest currently selected index and the target,
	 * in either direction */
	addRange(target: string): void
	remove(target: string): void
	clear(): void

	startDrag(target: string): void
	// performs the drag, mutating an array to match the new order
	completeDrag(): string[]
	cancelDrag(): void
	dragged(): string[]
	lastSelectedIndex(): number
	displayed(): string[]
}

export function createListContext(
	allItems: Accessor<string[] | undefined>
): ListContext {
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

	return {
		displayed,
		select(id) {
			setSelectedItems([id])
		},
		add(id) {
			setSelectedItems(prev => {
				if (prev.includes(id)) return prev
				return [...prev, id]
			})
		},
		addRange(id) {
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
		remove(id) {
			setSelectedItems(prev => {
				const index = prev.indexOf(id)
				if (index === -1) return prev
				return [...prev.slice(0, index), ...prev.slice(index + 1)]
			})
		},
		clear() {
			setSelectedItems([])
		},
		selected: selectedItems,
		dragged,
		startDrag(id) {
			if (!this.selected()?.includes(id)) {
				this.select(id)
			}
			setDragging(true)
		},
		completeDrag() {
			const dragged = [...this.dragged()]
			setDragging(false)
			return dragged
		},
		cancelDrag() {
			setDragging(false)
		},
		lastSelectedIndex() {
			const all = allItems()
			if (!all) return -1
			const selected = selectedItems()
			if (selected.length === 0) return -1
			return all.indexOf(selected[selected.length - 1])
		},
	}
}
