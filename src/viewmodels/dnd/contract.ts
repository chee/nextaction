import type {
	BaseEventPayload,
	ElementDragType,
	DropTargetRecord,
	Input,
} from "@atlaskit/pragmatic-drag-and-drop/types"
import {onCleanup, type Accessor} from "solid-js"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import type {
	AnyChildType,
	AnyChildURL,
	AnyParentType,
	ConceptURLMap,
	FlatChildTypesFor,
	FlatChildURLsFor,
} from ":concepts:"
import {refer} from "::shapes/reference.ts"
import {getType} from "::registries/type-registry.ts"
import {getParentURL} from "::registries/parent-registry.ts"

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

type GetDropTargetIndexArgs<T extends AnyParentType> = {
	element: HTMLElement
	items: Accessor<FlatChildURLsFor<T>[]>
	dragged: DraggableContract<FlatChildTypesFor<T>>

	input: Input
}

export const getMainType = (dragged: DraggableContract<AnyChildType>) => {
	if (dragged.items?.some(i => i.type == "area")) return "area" as const
	if (dragged.items?.some(i => i.type == "project")) return "project" as const
	if (dragged.items?.some(i => i.type == "heading")) return "heading" as const
	return "action" as const
}

const DropMask = {
	on: 1,
	around: 2,
}

// rules.[context].[draggedType].[dropTargetType]
const rules = {
	list: {
		area: {
			area: DropMask.around,
			action: 0,
			heading: 0,
			project: 0,
		},
		project: {
			area: 0,
			project: DropMask.around,
			action: DropMask.around,
			heading: 0,
		},
		heading: {
			area: 0,
			project: 0,
			action: DropMask.around,
			heading: DropMask.around,
		},
		action: {
			area: 0,
			project: DropMask.around,
			action: DropMask.around,
			heading: DropMask.on | DropMask.around,
		},
	},
	sidebar: {
		area: {
			action: 0,
			area: DropMask.around,
			heading: 0,
			project: DropMask.around,
			trash: DropMask.on,
		},
		project: {
			action: 0,
			area: DropMask.around | DropMask.on,
			heading: 0,
			project: DropMask.around,
			today: DropMask.on,
			upcoming: DropMask.on,
			trash: DropMask.on,
			someday: DropMask.on,
			anytime: DropMask.on,
		},
		heading: {
			area: 0,
			action: 0,
			heading: 0,
			project: DropMask.on,
			trash: DropMask.on,
		},
		action: {
			action: 0,
			area: DropMask.on,
			heading: 0,
			project: DropMask.on,
			inbox: DropMask.on,
			trash: DropMask.on,
			upcoming: DropMask.on,
			someday: DropMask.on,
			anytime: DropMask.on,
		},
	},
} as const

export function getDropPlacements(
	dropContext: "list" | "sidebar",
	item: DragAndDropItem<AnyChildType>,
	dragged: DraggableContract<AnyChildType>
): [boolean, boolean] {
	if (dragged.items.length == 0) return [false, false]
	const mainType = getMainType(dragged)
	const mask = rules[dropContext][mainType][item.type]
	const on = !!(mask & DropMask.on)
	const around = !!(mask & DropMask.around)
	const dropTargetParentType = getType(getParentURL(item.url))
	// todo check on non-project pages if this is correct
	if (mainType == dropTargetParentType) {
		return [false, false]
	}
	return [on, around]
}

export function getDropTargetInfo<T extends AnyParentType>({
	element,
	input,
	items,
	dragged,
}: GetDropTargetIndexArgs<T>) {
	const validElements = new Map<number, HTMLElement>()
	const validRectangles = new Map<number, DOMRect>()
	const validPlacements = new Map<number, [boolean, boolean]>()
	const distancesFromPageY = new Map<number, number>()
	const elements = new Map<AnyChildURL, HTMLElement>()
	const types = new Map<number, FlatChildTypesFor<T>>()

	for (const [index, el] of element.querySelectorAll("[draggable]").entries()) {
		if (el instanceof HTMLElement) {
			delete el.dataset.droptarget
			const url = items()[index]
			elements.set(url, el as HTMLElement)
			const type = getType(url) as FlatChildTypesFor<T>
			const item = refer(type, url)
			const placements = getDropPlacements("list", item, dragged)

			if (placements.filter(Boolean).length) {
				validElements.set(index, el)
				const rect = el.getBoundingClientRect()
				validPlacements.set(index, placements)
				validRectangles.set(index, rect)
				types.set(index, type)
				distancesFromPageY.set(index, Math.abs(input.clientY - rect.top))
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

	const isWithin =
		input.pageY >= nearestValidRectangle!.top &&
		input.pageY <= nearestValidRectangle!.bottom

	const placement = validPlacements.get(nearestValidElementIndex)

	const nearestElement = validElements.get(nearestValidElementIndex)

	let dropTargetIndex = 0

	let position: "on" | "above" | "below" | undefined = undefined
	if (nearestElement && nearestValidRectangle && placement) {
		const offset = input.clientY - nearestValidRectangle.top
		dropTargetIndex = nearestValidElementIndex
		const [canDropOn, canDropAround] = placement
		if (canDropOn && isWithin) {
			position = "on"
		} else if (canDropAround) {
			position = offset < nearestValidRectangle.height / 2 ? "above" : "below"
		}

		const keys = [...validRectangles.keys()]
		const lastRectangle = validRectangles.get(keys[keys.length - 1])
		const lastCanBeAround = validPlacements.get(keys[keys.length - 1])
		if (
			lastRectangle &&
			lastCanBeAround &&
			input.pageY >= lastRectangle.bottom
		) {
			dropTargetIndex = keys[keys.length - 1]
			position = "below"
		}
	}

	const dropTargetURL = items()[dropTargetIndex]
	const dropTargetElement = elements.get(dropTargetURL)

	return {
		validDropTargetElements: validElements,
		validDropTargetPlacements: validPlacements,
		validDropTargetRectangles: validRectangles,
		dropTargetElement,
		dropTargetURL,
		dropTargetIndex,
		position,
	}
}
