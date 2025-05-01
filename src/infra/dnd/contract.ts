import type {
	BaseEventPayload,
	ElementDragType,
	DropTargetRecord,
} from "@atlaskit/pragmatic-drag-and-drop/types"
import {onCleanup} from "solid-js"
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import type {SelectionContext} from "../hooks/selection-context.ts"

export type DraggedPayload = {
	type: string
	items: string[]
	abovebelow?: "above" | "below"
}

export type DropTargetPayload = {
	accepts: string[]
	drop(payload: DraggedPayload): void
}

export function getDraggedPayload(payload: {
	source: BaseEventPayload<ElementDragType>["source"]
}): DraggedPayload | undefined {
	return payload.source.data as DraggedPayload
}

export function getDropTarget(
	payload: BaseEventPayload<ElementDragType>
): DropTargetRecord | undefined {
	return payload.location.current.dropTargets[0]
}

export function getDropTargetPayload(
	payload: BaseEventPayload<ElementDragType>
): DropTargetPayload | undefined {
	return getDropTarget(payload)?.data as DropTargetPayload
}

export function manageDrop(payload: BaseEventPayload<ElementDragType>) {
	const dragged = getDraggedPayload(payload)
	const dropTarget = getDropTargetPayload(payload)
	if (!dragged || !dropTarget) return
	if (dropTarget.accepts.includes(dragged.type)) {
		dropTarget.drop(dragged)
	}
}

export function getInput(payload: BaseEventPayload<ElementDragType>) {
	return payload.location.current.input
}

export function updateData(
	payload: BaseEventPayload<ElementDragType>,
	data: Record<string, unknown>
) {
	Object.assign(payload.source.data, data)
}

export function calculateAboveBelowOnDrag(
	element: Element,
	payload: BaseEventPayload<ElementDragType>
) {
	const dropTarget = getDropTarget(payload)
	if (!dropTarget) return

	if (element == dropTarget.element) {
		const rect = element.getBoundingClientRect()
		const offset = payload.location.current.input.clientY - rect.top
		const abovebelow = offset < rect.height / 2 ? "above" : "below"
		updateData(payload, {abovebelow})
		return abovebelow
	}
}

export function createDraggable(
	element: HTMLElement,
	itemViewModel: {type: string; url: string},
	selection: SelectionContext
) {
	return onCleanup(
		draggable({
			element,
			getInitialData: () => ({type: itemViewModel.type, items: []}),
			onDragStart: () => selection.startDrag(itemViewModel.url),
			onDrop: payload => updateData(payload, {items: selection.completeDrag()}),
		})
	)
}

export function createDropTarget(
	element: HTMLElement,
	getData: () => DropTargetPayload,
	canDrop?: Parameters<typeof dropTargetForElements>[0]["canDrop"]
) {
	return onCleanup(
		dropTargetForElements({
			canDrop(payload) {
				const data = getData()
				const dragged = getDraggedPayload(payload)
				if (dragged && data.accepts.includes(dragged.type)) {
					return true
				}

				return canDrop?.(payload) ?? true
			},
			element,
			onDragEnter() {
				element.setAttribute("droptarget", "true")
			},
			onDragLeave() {
				element.removeAttribute("droptarget")
			},
			onDrop(payload) {
				element.removeAttribute("droptarget")
				manageDrop(payload)
			},
			getData,
		})
	)
}

export function createListDropTarget(
	element: HTMLElement,
	itemViewModel: {type: string; url: string},
	selection: SelectionContext,
	getData: () => DropTargetPayload,
	canDrop?: Parameters<typeof dropTargetForElements>[0]["canDrop"]
) {
	return onCleanup(
		dropTargetForElements({
			canDrop(payload) {
				return canDrop?.(payload) ?? true
			},
			element,
			onDragEnter() {
				element.setAttribute("droptarget", "true")
			},
			onDragLeave() {
				element.removeAttribute("droptarget")
			},
			onDrag(payload) {
				const abovebelow = calculateAboveBelowOnDrag(element, payload)
				if (abovebelow) {
					selection.setDropTarget({
						url: itemViewModel.url,
						abovebelow,
					})
				}
			},
			onDrop(payload) {
				element.removeAttribute("droptarget")
				manageDrop(payload)
				selection.setDropTarget(undefined)
			},
			getData,
		})
	)
}
