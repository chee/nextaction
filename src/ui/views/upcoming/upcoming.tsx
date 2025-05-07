import {createDateNow} from "@solid-primitives/date"
import type {ActionURL} from "::shapes/action.ts"
import {isClosed, isDoable} from "::shapes/mixins/doable.ts"
import type {ProjectURL} from "::shapes/project.ts"
import flattenTree from "::core/util/flattenTree.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::domain/dnd/dnd-context.ts"
import {useHomeContext} from "::domain/entities/useHome.ts"
import {createSelectionContext} from "::domain/state/useSelection.ts"
import {useStagingArea} from "::domain/state/useStagingArea.ts"
import {useSelectionHotkeys} from "../standard/inbox.tsx"
import type {ChildEntitiesFor} from ":concepts:"
import type {Action} from "::domain/entities/useAction.ts"
import type {Project} from "::domain/entities/useProject.ts"

/*
	// todo
	pages have a context and a filter
	a context like: inbox, home, project, area
	a filter like: today, anytime, someday, open, closed, tag
	let's codify that in a nice hook
*/

export default function UpcomingView() {
	const [_now] = createDateNow(60 * 1000)

	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useStagingArea()

	type SelectableItemURL = ActionURL | ProjectURL
	const selectableItemFilter = (item: ChildEntitiesFor<"home">) =>
		(isDoable(item) && item.when && !item.deleted && !isClosed(item)) ||
		wasRecentlyClosed(item.url)

	const selectableItemURLs = () =>
		flattenTree(home.list.items)
			.filter(selectableItemFilter)
			.map(u => u.url) as SelectableItemURL[]

	const selection = createSelectionContext<SelectableItemURL>(() =>
		selectableItemURLs()
	)

	const _toggleCompleted = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}

	const _toggleCanceled = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	useSelectionHotkeys<SelectableItemURL>({
		selection,
		selectableItemURLs,
	})

	// const expander = useExpander<SelectableItemURL>(selection)

	// useCompleteHotkeys({
	// 	actions: () => home.upcoming.items.filter(selectableItemsFilter),
	// 	selection,
	// 	toggleItemCompleted: toggleCompleted,
	// 	toggleItemCanceled: toggleCanceled,
	// })

	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div
				ref={_element => {
					// dnd.createDraggableList(element)
				}}
				class="upcoming page-container page-container--built-in">
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
