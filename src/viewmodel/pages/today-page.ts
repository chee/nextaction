import {newAction, parseWhen, type ActionURL} from "@/domain/action.ts"
import {useHome} from "@/viewmodel/home.ts"
import {useExpandedAction, type PageContext} from "@/viewmodel/generic/page.ts"
import {
	createDraggable,
	createListDropTarget,
} from "../../infra/dnd/contract.ts"
import {createSelectionContext} from "../../infra/hooks/selection-context.ts"
import {curl} from "../../infra/sync/automerge-repo.ts"

export function useTodayPage() {
	const home = useHome()
	const selection = createSelectionContext(() =>
		home.today.map(action => action.url)
	)

	return {
		get today() {
			return home.today
		},
		selection,
		...useExpandedAction(selection),
		newAction(index) {
			const url = curl<ActionURL>(newAction({when: parseWhen(new Date())}))
			home.list.addItem("action", url, index)
			return url
		},
		createDraggable(element, itemViewModel) {
			return createDraggable(element, itemViewModel, selection)
		},
		createDropTarget(element, itemViewModel) {
			return createListDropTarget(element, itemViewModel, selection, () => {
				return {
					accepts: ["action"],
					drop(opts) {
						if (opts.type !== "action") return
						if (opts.abovebelow == "below") {
							home.list.moveItemAfter(
								"action",
								opts.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						} else {
							home.list.moveItemBefore(
								"action",
								opts.items as ActionURL[],
								itemViewModel.url as ActionURL
							)
						}
					},
				}
			})
		},
	} satisfies PageContext & Record<string, unknown>
}
