import {mapArray} from "solid-js"
import {isClosed, type Doable} from "../../../domain/generic/doable.ts"
import type {ActionViewModel} from "../../../viewmodel/action.ts"
import {
	useExpander,
	useRecentlyRemoved,
} from "../../../viewmodel/helpers/page.ts"
import {useHome, useHomeContext} from "../../../viewmodel/home.ts"
import type {ProjectViewModel} from "../../../viewmodel/project.ts"
import flattenTree from "../../../infra/lib/flattenTree.ts"
import type {AnyDoableViewModel} from "../../../viewmodel/mixins/doable.ts"
import {createSelectionContext} from "../../../infra/hooks/selection-context.ts"
import type {ActionURL} from "../../../domain/action.ts"
import type {ProjectURL} from "../../../domain/project.ts"
import {useSelectionHotkeys} from "../standard/inbox.tsx"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "../../../infra/dnd/dnd-context.ts"
import {createMemo} from "solid-js"
import {createDateNow} from "@solid-primitives/date"

/*
	// todo
	pages have a context and a filter
	a context like: inbox, home, project, area
	a filter like: today, anytime, someday, open, closed, tag
	let's codify that in a nice hook
*/

export default function Upcoming() {
	const [now] = createDateNow(60 * 1000)

	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useRecentlyRemoved()

	type SelectableItemURL = ActionURL | ProjectURL
	const selectableItemFilter = (item: AnyDoableViewModel) =>
		(item.when && !item.deleted && !isClosed(item)) ||
		wasRecentlyClosed(item.url)

	const selectableItemURLs = () =>
		flattenTree(home.list.items)
			.filter(selectableItemFilter)
			.map(u => u.url) as SelectableItemURL[]

	const selection = createSelectionContext<SelectableItemURL>(() =>
		selectableItemURLs()
	)

	const toggleCompleted = (
		item: ActionViewModel | ProjectViewModel,
		force?: boolean
	) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (
		item: ActionViewModel | ProjectViewModel,
		force?: boolean
	) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	useSelectionHotkeys<SelectableItemURL>({
		selection,
		selectableItemURLs,
	})

	const expander = useExpander<SelectableItemURL>(selection)

	// useCompleteHotkeys({
	// 	actions: () => home.upcoming.items.filter(selectableItemsFilter),
	// 	selection,
	// 	toggleItemCompleted: toggleCompleted,
	// 	toggleItemCanceled: toggleCanceled,
	// })

	const dnd = createDragAndDropContext<SelectableItemURL>(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div
				ref={element => {
					// dnd.createDraggableList(element)
				}}
				class="upcoming page-container page-container--built-in">
				{/* <Bar>
					<BarNewAction
						newAction={upcoming.newAction}
						newProject={upcoming.newProject}
					/>
					<BarMenu />
				</Bar> */}
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">📅</div>
						<span class="page-title__title">Upcoming</span>
					</h1>

					<main class="page-content" />
				</div>
			</div>
		</DragAndDropProvider>
	)
}
