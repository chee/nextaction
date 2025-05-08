/* eslint-disable @typescript-eslint/no-namespace */
import {createContext, createSignal, onCleanup} from "solid-js"
import {useContext} from "solid-js"
import {
	draggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
	getDraggedPayload,
	getDropTargetInfo,
	getInput,
	updateDraggedItems,
	type DragAndDropItem,
} from "./contract.ts"
import type {
	AnyChild,
	AnyChildType,
	AnyParentType,
	FlatChildURLsFor,
} from ":concepts:"
import {getParentURL} from "::registries/parent-registry.ts"
import {getType} from "::registries/type-registry.ts"
import type {GlobalSelectionContext} from "../selection/useSelection.ts"
import type {Reference} from "::shapes/reference.ts"
import {useMovements} from "::domain/movements/useMovements.ts"

export type DragAndDropContext = {
	createDraggableListItem(element: HTMLElement, item: () => string): void
	createDraggableList(element: HTMLElement): void
	get active(): boolean
}

export const DragAndDropContext = createContext<DragAndDropContext>()
export const DragAndDropProvider = DragAndDropContext.Provider

export function useDragAndDrop() {
	const context = useContext(DragAndDropContext)
	if (!context) {
		throw new Error("useDragAndDrop must be used within a DragAndDropProvider")
	}
	return context
}

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			draggable: string
		}
	}
}

export function createDragAndDropContext<P extends AnyParentType>(
	selection: SelectionContext<FlatChildURLsFor<P>>
) {
	// todo remove selection when click on page background

	const [active, setActive] = createSignal(false)
	const movements = useMovements()
	return {
		get active() {
			return active()
		},
		createDraggableList(element: HTMLElement) {
			onCleanup(
				dropTargetForElements({
					element,
					onDrop(payload) {
						const dragged = getDraggedPayload(payload)
						if (!dragged) return
						const input = getInput(payload)
						const {position, dropTargetURL} = getDropTargetInfo({
							element,
							input,
							items: selection.all,
							dragged,
						})
						movements.drop(
							dragged.items.map(i => i.url),
							// @ts-expect-error todo
							dropTargetURL,
							position
						)
					},
					onDrag(payload) {
						const dragged = getDraggedPayload(payload)
						const input = getInput(payload)

						if (!dragged) return

						const {dropTargetElement, position} = getDropTargetInfo({
							element,
							input,
							items: selection.all,
							dragged,
						})

						if (dropTargetElement) {
							dropTargetElement.dataset.droptarget = position
						}
					},
					onDragLeave() {
						element.querySelectorAll("[draggable]").forEach(e => {
							delete (e as HTMLElement).dataset.droptarget
						})
					},
				})
			)
		},
		createDraggableListItem(
			element: HTMLElement,
			url: () => FlatChildURLsFor<P>
		) {
			onCleanup(
				draggable({
					element,
					onDragStart(payload) {
						setActive(true)
						if (!selection.isSelected(url())) {
							selection.select(url())
						}
						const selected = selection.selected()
						updateDraggedItems(
							payload,
							// @ts-expect-error todo
							selected
								.map(url => {
									const parentURL = getParentURL(url)
									return {
										parentType: getType(parentURL),
										parentURL,
										url: url,
										type: getType(url),
									}
								})
								.filter(item => {
									let currentParent: Reference<AnyChild> | null = {
										type: item.parentType,
										url: item.parentURL,
									}
									while (currentParent) {
										if (selection.isSelected(currentParent.url)) {
											// If the parent is also being dragged, exclude this item
											return false
										}
										if (
											currentParent.type == "area" ||
											currentParent.type == "home" ||
											currentParent.type == "inbox"
										) {
											break
										}
										currentParent = {
											type: getType(getParentURL(currentParent.url)),
											url: getParentURL(currentParent.url),
										}
									}
									return true
								})
						)
					},
					onDrop() {
						setActive(false)
					},
				})
			)
		},
	} satisfies DragAndDropContext
}

export function createSimpleDraggable<C extends AnyChildType>(
	element: HTMLElement,
	info: () => DragAndDropItem<C>
) {
	onCleanup(
		draggable({
			element,
			onDragStart(payload) {
				element.dataset.dragged = "true"
				updateDraggedItems(payload, [info()])
			},
			onDrop() {
				delete element.dataset.dragged
			},
		})
	)
}
