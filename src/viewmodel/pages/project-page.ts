import {createSelectionContext} from "@/infra/hooks/selection-context.ts"
import {newAction, type ActionURL} from "@/domain/action.ts"
import {
	useExpandedAction,
	useRecentlyRemoved,
	type PageContext,
} from "@/viewmodel/generic/page.ts"
import {createDraggable, createListDropTarget} from "@/infra/dnd/contract.ts"
import type {ActionViewModel} from "@/viewmodel/action.ts"
import type {ProjectURL} from "@/domain/project.ts"
import {mapArray, type Accessor} from "solid-js"
import {useProject} from "../project.ts"
import {curl} from "@/infra/sync/automerge-repo.ts"
import {useHome} from "../home.ts"
import type {HeadingViewModel} from "../heading.ts"
import mergeDescriptors from "merge-descriptors"

export function useProjectPage(url: Accessor<ProjectURL>) {
	const home = useHome()
	const project = useProject(url)
	const list = useProjectListContext(() => home.forProject(url()))
	const selection = createSelectionContext(() => list.visibleItemURLs)

	return mergeDescriptors(list, {
		project,
		selection,
		...useExpandedAction(selection),
		newAction(index: number) {
			const url = curl<ActionURL>(newAction())
			home.list.addItem("action", url, index)
			return url
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
	}) satisfies PageContext & Record<string, unknown>
}

type ProjectItemViewModel = HeadingViewModel | ActionViewModel

export function useProjectListContext(items: () => ProjectItemViewModel[]) {
	const {
		recentlyRemoved,
		toggleItemCanceled,
		toggleItemComplete,
		toggleHeadingArchived,
	} = useRecentlyRemoved()

	const urls = mapArray(items, item => item.url)

	return {
		toggleItemCanceled,
		toggleItemComplete,
		toggleHeadingArchived,
		get items() {
			return items()
		},
		get itemURLs() {
			return urls()
		},
		get visibleItems() {
			return this.items.filter(item => {
				if (item.type == "heading") {
					return !item.archived
				}
				if (item.type == "action") {
					return (
						(!item.closed && !item.deleted) ||
						recentlyRemoved().includes(item.url)
					)
				}
			})
		},
		get visibleItemURLs() {
			return this.visibleItems.map(
				(item: HeadingViewModel | ActionViewModel) => item.url
			)
		},
		get loggedItems() {
			return this.items.filter(
				item =>
					(item.type == "heading" && item.archived) ||
					(item.type == "action" && item.closed)
			)
		},
		get loggedItemURLs() {
			return this.loggedItems.map(
				(item: HeadingViewModel | ActionViewModel) => item.url
			)
		},
	}
}
