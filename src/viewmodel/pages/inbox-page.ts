import {createSelectionContext} from "@/infra/hooks/selection-context.ts"
import type {ActionURL} from "@/domain/action.ts"
import {useHome} from "@/viewmodel/home.ts"
import {
	useExpandedAction,
	useRecentlyRemoved,
	type PageContext,
} from "@/viewmodel/generic/page.ts"
import {createDraggable, createListDropTarget} from "@/infra/dnd/contract.ts"
import {useDoableListContext} from "../generic/doable-list.ts"
import mergeDescriptors from "merge-descriptors"
import type {ActionViewModel} from "../action.ts"
import type {HeadingViewModel} from "../heading.ts"
import {mapArray} from "solid-js"

export function useInboxPage() {
	const home = useHome()
	const inbox = home.inbox
	const doable = useDoableListContext(() => home.inbox.items)
	const selection = createSelectionContext(() => doable.visibleItemURLs)

	return mergeDescriptors(doable, {
		inbox,
		selection,
		...useExpandedAction(selection),
		newAction(index: number) {
			return inbox.newAction({}, index)
		},
		createDraggable(element: HTMLElement, itemViewModel: ActionViewModel) {
			return createDraggable(element, itemViewModel, selection)
		},
		createDropTarget(element: HTMLElement, itemViewModel: ActionViewModel) {
			return createListDropTarget(element, itemViewModel, selection, () => {
				return {
					accepts: ["action"],
					drop(opts) {
						if (opts.type !== "action") return
						if (opts.abovebelow == "below") {
							inbox.moveActionAfter(
								opts.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						} else {
							inbox.moveActionBefore(
								opts.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						}
					},
				}
			})
		},
	}) satisfies PageContext & Record<string, unknown>
}
