import type {
	BaseEventPayload,
	ElementDragType,
	DropTargetRecord,
	Input,
} from "@atlaskit/pragmatic-drag-and-drop/types"
import {onCleanup, type Accessor} from "solid-js"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {getType, type ItemType} from "../type-registry.ts"

export type DragAndDropItem = {
	type: ItemType
	url: AutomergeUrl
}

export type DraggableContract = {items: DragAndDropItem[]}

export type DropTargetContract = {
	accepts(source?: DraggableContract): boolean
	drop(payload: DraggableContract, input: Input): void
}

export type DropTargetListContract = DropTargetContract & {
	items(): AutomergeUrl[]
	childAccepts(item: DragAndDropItem, source: DraggableContract): boolean
}

export function getDraggedPayload(payload: {
	source: BaseEventPayload<ElementDragType>["source"]
}): DraggableContract | undefined {
	return payload.source.data as DraggableContract
}

export function getDropTarget(
	payload: BaseEventPayload<ElementDragType>
): DropTargetRecord | undefined {
	return payload.location.current.dropTargets[0]
}

export function getDropTargetPayload(
	payload: BaseEventPayload<ElementDragType>
): DropTargetContract | undefined {
	return getDropTarget(payload)?.data as DropTargetContract
}

export function manageDrop(
	payload: BaseEventPayload<ElementDragType>,
	contract: DropTargetContract
) {
	const dragged = getDraggedPayload(payload)
	const input = getInput(payload)
	if (!dragged) return
	contract.drop(dragged, input)
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

export function updateDraggedItems(
	payload: BaseEventPayload<ElementDragType>,
	items: DragAndDropItem[]
) {
	Object.assign(payload.source.data, {items} as DraggableContract)
}

export function calculateAboveBelow(element: Element, clientY: number) {
	const rect = element.getBoundingClientRect()
	const offset = clientY - rect.top
	const abovebelow = offset < rect.height / 2 ? "above" : "below"
	return abovebelow
}

export function createDropTarget(
	element: HTMLElement,
	contract: DropTargetContract
) {
	return onCleanup(
		dropTargetForElements({
			canDrop(payload) {
				const dragged = getDraggedPayload(payload)
				return !!dragged && contract.accepts(dragged)
			},
			element,
			onDragEnter(payload) {
				if (contract?.accepts(getDraggedPayload(payload))) {
					payload.self.element.dataset.droptarget = "true"
				}
			},
			onDragLeave(payload) {
				delete payload.self.element.dataset.droptarget
			},
			onDrop(payload) {
				delete payload.self.element.dataset.droptarget
				delete payload.source.element.dataset.droptarget
				if (!contract) return
				manageDrop(payload, contract)
			},
		})
	)
}

export function createDropTargetList(
	element: HTMLElement,
	contract: DropTargetListContract
) {
	return onCleanup(
		dropTargetForElements({
			canDrop(payload) {
				const dragged = getDraggedPayload(payload)
				if (!dragged) return false
				return !!dragged && contract.accepts(dragged)
			},
			element,
			onDrop(payload) {
				if (!contract) return
				manageDrop(payload, contract)
			},
		})
	)
}
type GetDropTargetIndexArgs<T extends AutomergeUrl = AutomergeUrl> = {
	element: HTMLElement
	items: Accessor<T[]>
	dragged: DraggableContract
	isValidDropTarget: DropTargetListContract["childAccepts"]
	input: Input
}

export function getDropTargetIndex<T extends AutomergeUrl = AutomergeUrl>({
	element,
	input,
	items,
	dragged,
	isValidDropTarget,
}: GetDropTargetIndexArgs<T>) {
	// const keyed = new Map<number, HTMLElement>()
	const validElements = new Map<number, HTMLElement>()
	const validRectangles = new Map<number, DOMRect>()
	const distancesFromPageY = new Map<number, number>()

	for (const [index, el] of element.querySelectorAll("[draggable]").entries()) {
		if (el instanceof HTMLElement) {
			// keyed.set(index, el)
			delete el.dataset.droptarget
			const url = items()[index]
			const type = getType(url)
			const item = {url, type}
			if (isValidDropTarget(item, dragged)) {
				validElements.set(index, el)
				const rect = el.getBoundingClientRect()
				validRectangles.set(index, rect)
				distancesFromPageY.set(index, Math.abs(input.pageY - rect.top))
			}
		}
	}

	const nearestValidElementIndex = distancesFromPageY
		.entries()
		.reduce((nearest, [index, distance]) => {
			if (nearest == -1) {
				return index
			}
			const accDistance = distancesFromPageY.get(nearest)
			if (distance < accDistance!) {
				return index
			}
			return nearest
		}, -1)

	const nearestValidRectangle = validRectangles.get(nearestValidElementIndex)

	const nearestElement = validElements.get(nearestValidElementIndex)

	let dropTargetIndex = 0

	let above = true
	if (nearestElement && nearestValidRectangle) {
		const offset = input.clientY - nearestValidRectangle.top
		dropTargetIndex = nearestValidElementIndex
		if (offset > nearestValidRectangle.height / 2) {
			above = false
		}

		const keys = [...validRectangles.keys()]
		const lastRectangle = validRectangles.get(keys[keys.length - 1])
		console.log(
			input.pageY,
			lastRectangle?.bottom,
			validElements.get(keys[keys.length - 1])
		)

		if (lastRectangle) {
			if (input.pageY >= lastRectangle.bottom) {
				console.log(input.pageY, lastRectangle.bottom)
				dropTargetIndex = keys[keys.length - 1]
				above = false
			}
		}
	}

	const dropTargetElement = validElements.get(dropTargetIndex)
	const dropTargetURL = items()[dropTargetIndex]

	return {
		dropTargetElement,
		dropTargetURL,
		dropTargetIndex,
		isAbove: above,
	}
}
