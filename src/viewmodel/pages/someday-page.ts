import {newAction, type ActionURL} from "@/domain/action.ts"
import {useHome} from "@/viewmodel/home.ts"
import {useExpandedAction, type PageContext} from "@/viewmodel/generic/page.ts"
import {createDraggable, createListDropTarget} from "@/infra/dnd/contract.ts"
import {createSelectionContext} from "@/infra/hooks/selection-context.ts"
import {curl} from "@/infra/sync/automerge-repo.ts"
import {useDoableListContext} from "../generic/doable-list.ts"
import mergeDescriptors from "merge-descriptors"
import type {AnyDoableViewModel} from "../generic/doable.ts"
import {isSomeday} from "../../domain/generic/doable.ts"

export function useSomedayPage() {
	const home = useHome()

	const doable = useDoableListContext(() => home.doables.filter(isSomeday))
	const selection = createSelectionContext(() => doable.itemURLs)
	const expanded = useExpandedAction(selection)

	return mergeDescriptors(doable, {
		selection,
		...expanded,
		newAction(index?: number) {
			const url = curl<ActionURL>(newAction({when: "someday"}))
			home.list.addItem("action", url, index)
			expanded.expand(url)
			return url
		},
		createDraggable(element: HTMLElement, itemViewModel: AnyDoableViewModel) {
			return createDraggable(element, itemViewModel, selection)
		},
		createDropTarget(element: HTMLElement, itemViewModel: AnyDoableViewModel) {
			return createListDropTarget(element, itemViewModel, selection, () => {
				return {
					accepts: ["action"],
					drop(dragged) {
						if (dragged.type !== "action") return
						if (dragged.abovebelow == "below") {
							home.list.moveItemAfter(
								"action",
								dragged.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						} else {
							home.list.moveItemBefore(
								"action",
								dragged.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						}
					},
				}
			})
		},
	}) satisfies PageContext & Record<string, unknown>
}
