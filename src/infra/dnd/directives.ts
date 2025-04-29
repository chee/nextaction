import {
	draggable as pdnddraggable,
	dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {onCleanup} from "solid-js"

type DraggableArgs = Omit<
	Parameters<typeof pdnddraggable>[0],
	"element" | "getInitialData"
>

export function draggable(
	element: HTMLElement,
	initialData: Record<string, unknown> | boolean,
	args: DraggableArgs = {}
) {
	onCleanup(
		pdnddraggable({
			element,
			getInitialData() {
				if (typeof initialData === "boolean") {
					return {}
				}
				return initialData
			},
			...args,
		})
	)
}

type DropTargetArgs = Omit<
	Parameters<typeof dropTargetForElements>[0],
	"element"
>

export function droptarget(
	element: HTMLElement,
	args: DropTargetArgs | boolean = {}
) {
	onCleanup(
		dropTargetForElements({
			element,
			...(typeof args === "boolean" ? {} : args),
		})
	)
}

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			draggable: [Record<string, unknown>] | boolean
			droptarget: boolean | DropTargetArgs
		}
	}
}
