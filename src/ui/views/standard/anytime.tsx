import {For, Switch, Match, Show, createMemo, mapArray} from "solid-js"
import {useHomeContext} from "::domain/entities/useHome.ts"
import {useStagingArea} from "::domain/state/useStagingArea.ts"
import {isAction, type Action} from "::domain/entities/useAction.ts"
import {isAnytime, isClosed} from "::shapes/mixins/doable.ts"
import flattenTree from "::core/util/flattenTree.ts"
import {createSelectionContext} from "::domain/state/useSelection.ts"
import {useSelectionHotkeys} from "./inbox.tsx"
import type {ActionURL} from "::shapes/action.ts"
import {useExpander} from "::domain/state/useExpander.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::domain/dnd/dnd-context.ts"
import {TodayAction} from "../today/today-action.tsx"
import type {ProjectURL} from "::shapes/project.ts"
import {GroupedProject} from "../../components/projects/grouped-project.tsx"
import {isProject, type Project} from "::domain/entities/useProject.ts"
import {isArea, type Area} from "::domain/entities/useArea.ts"

export default function AnytimeView() {
	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useStagingArea()

	const selectableItemFilter = (item: (typeof home.list.items)[number]) =>
		isAction(item) &&
		isAnytime(item) &&
		((!item.deleted && !isClosed(item)) || wasRecentlyClosed(item.url))

	const toggleCompleted = (item: Action, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: Action, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	const selectableItems = createMemo(
		() => flattenTree(home.list.items).filter(selectableItemFilter) as Action[]
	)

	const selectableItemURLs = mapArray(selectableItems, i => i.url)

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs,
	})

	const expander = useExpander<"action">(selection)

	// todo a TodayDropTargetViewModel that can be used by this page and the
	// sidebar button
	// todo remove selection when click on page background

	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div class="page">
				<h1 class="page-title">
					<div class="page-title__icon">🌻</div>
					<span class="page-title__title">Anytime</span>
				</h1>
				<main class="page-content">
					<For each={home.list.items}>
						{item => (
							<Switch>
								<Match when={isAction(item) && selectableItemFilter(item)}>
									<TodayAction
										action={item as Action}
										selection={selection}
										expander={expander}
										toggleCompleted={() => toggleCompleted(item as Action)}
										toggleCanceled={() => toggleCanceled(item as Action)}
									/>
								</Match>
								<Match when={isProject(item)}>
									<GroupedProject
										project={item as Project}
										selection={selection}
										expander={expander}
										filter={selectableItemFilter}
										toggleActionCanceled={toggleCanceled}
										toggleActionCompleted={toggleCompleted}
									/>
								</Match>
								<Match when={isArea(item)}>
									<Show
										when={
											(item as Area).items.filter(selectableItemFilter).length
										}>
										<Switch>
											<Match when={isProject(item)}>
												<GroupedProject
													project={item as Project}
													selection={selection}
													expander={expander}
													filter={selectableItemFilter}
													toggleActionCompleted={toggleCompleted}
													toggleActionCanceled={toggleCanceled}
												/>
											</Match>
											<Match when={isAction(item)}>
												<TodayAction
													action={item as Action}
													selection={selection}
													expander={expander}
													toggleCompleted={() =>
														toggleCompleted(item as Action)
													}
													toggleCanceled={() => toggleCanceled(item as Action)}
												/>
											</Match>
										</Switch>
									</Show>
								</Match>
							</Switch>
						)}
					</For>
				</main>
			</div>
		</DragAndDropProvider>
	)
}
