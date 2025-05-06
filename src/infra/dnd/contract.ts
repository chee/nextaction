import type {
	BaseEventPayload,
	ElementDragType,
	DropTargetRecord,
	Input,
} from "@atlaskit/pragmatic-drag-and-drop/types"
import {onCleanup, type Accessor} from "solid-js"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {getType} from "../type-registry.ts"
import type {
	AnyChildType,
	AnyParentType,
	ConceptURLMap,
	FlatChildTypesFor,
	FlatChildURLsFor,
} from "::concepts"
import {refer} from "::domain/reference.ts"

export type DragAndDropItem<ItemType extends AnyChildType> = {
	type: ItemType
	url: ConceptURLMap[ItemType]
}

export type DraggableContract<ItemType extends AnyChildType> = {
	items: DragAndDropItem<ItemType>[]
}

export type DropTargetContract<ParentType extends AnyParentType> = {
	accepts(source?: DraggableContract<FlatChildTypesFor<ParentType>>): boolean
	drop(
		payload: DraggableContract<FlatChildTypesFor<ParentType>>,
		input: Input
	): void
}

export type DropTargetListContract<ParentType extends AnyParentType> =
	DropTargetContract<ParentType> & {
		items(): ConceptURLMap[FlatChildTypesFor<ParentType>][]
		childAccepts(
			item: DragAndDropItem<FlatChildTypesFor<ParentType>>,
			source: DraggableContract<FlatChildTypesFor<ParentType>>
		): boolean
	}

export function getDraggedPayload<T extends AnyChildType>(payload: {
	source: BaseEventPayload<ElementDragType>["source"]
}): DraggableContract<T> | undefined {
	return payload.source.data as DraggableContract<T>
}

export function getDropTarget(
	payload: BaseEventPayload<ElementDragType>
): DropTargetRecord | undefined {
	return payload.location.current.dropTargets[0]
}

export function getDropTargetPayload<T extends AnyParentType>(
	payload: BaseEventPayload<ElementDragType>
): DropTargetContract<T> | undefined {
	return getDropTarget(payload)?.data as DropTargetContract<T>
}

export function manageDrop<T extends AnyParentType>(
	payload: BaseEventPayload<ElementDragType>,
	contract: DropTargetContract<T>
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

export function updateDraggedItems<T extends AnyChildType>(
	payload: BaseEventPayload<ElementDragType>,
	items: DragAndDropItem<T>[]
) {
	Object.assign(payload.source.data, {items} as DraggableContract<T>)
}

export function calculateAboveBelow(element: Element, clientY: number) {
	const rect = element.getBoundingClientRect()
	const offset = clientY - rect.top
	const abovebelow = offset < rect.height / 2 ? "above" : "below"
	return abovebelow
}

export function createDropTarget<T extends AnyParentType>(
	element: HTMLElement,
	contract: DropTargetContract<T>
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
					;(payload.self.element as HTMLElement).dataset.droptarget = "true"
				}
			},
			onDragLeave(payload) {
				delete (payload.self.element as HTMLElement).dataset.droptarget
			},
			onDrop(payload) {
				delete (payload.self.element as HTMLElement).dataset.droptarget
				delete payload.source.element.dataset.droptarget
				if (!contract) return
				manageDrop(payload, contract)
			},
		})
	)
}

export function createDropTargetList<T extends AnyParentType>(
	element: HTMLElement,
	contract: DropTargetListContract<T>
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
type GetDropTargetIndexArgs<T extends AnyParentType> = {
	element: HTMLElement
	items: Accessor<FlatChildURLsFor<T>[]>
	dragged: DraggableContract<FlatChildTypesFor<T>>
	isValidDropTarget: DropTargetListContract<T>["childAccepts"]
	input: Input
}

export function getDropTargetIndex<T extends AnyParentType>({
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
			const item = refer(type, url)
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

		if (lastRectangle) {
			if (input.pageY >= lastRectangle.bottom) {
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
