/* eslint-disable @typescript-eslint/no-namespace */
import {createContext, createSignal, onCleanup} from "solid-js"
import {useContext} from "solid-js"
import {draggable} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {updateDraggedItems, type DragAndDropItem} from "./contract.ts"
import type {SelectionContext} from "../hooks/selection-context.ts"
import {getParentURL} from "../parent-registry.ts"
import {getType} from "../type-registry.ts"
import type {AnyChildType, AnyParentType, FlatChildURLsFor} from "::concepts"

export type DragAndDropContext = {
	createDraggableListItem(element: HTMLElement, item: () => string): void
	// createListDropTarget(element: HTMLElement, accepts: string[]): void
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
	return {
		get active() {
			return active()
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
						updateDraggedItems(
							payload,
							selection.selected().map(url => {
								const parentURL = getParentURL(url)
								return {
									parentType: getType(parentURL),
									parentURL,
									url: url,
									type: getType(url),
								}
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
