// import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import ActionList from "::ui/components/actions/action-list.tsx"
import {useSelectionHotkeys} from "./inbox.tsx"
import {useHomeContext} from "::domain/entities/useHome.ts"
import {useStagingArea} from "::domain/state/useStagingArea.ts"
import {isProject, type Project} from "::domain/entities/useProject.ts"
import {isAction, type Action} from "::domain/entities/useAction.ts"
import {isClosed, isSomeday} from "::shapes/mixins/doable.ts"
import type {ActionURL} from "::shapes/action.ts"
import flattenTree from "::core/util/flattenTree.ts"
import {createMemo, For, Match, Show, Switch} from "solid-js"
import type {ProjectURL} from "::shapes/project.ts"
import {
	createSelectionContext,
	type Selection,
} from "::domain/state/useSelection.ts"
import {useExpander} from "::domain/state/useExpander.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::domain/dnd/dnd-context.ts"
import {TodayAction} from "../today/today-action.tsx"
import {TodayProject} from "../today/today-project.tsx"
import {isArea, type Area} from "::domain/entities/useArea.ts"
import DevelopmentNote from "../../components/development-note.tsx"

export default function SomedayView() {
	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useStagingArea()

	const selectableItemsFilter = (item: (typeof home.list.items)[number]) =>
		(isProject(item) || isAction(item)) &&
		isSomeday(item) &&
		((!item.deleted && !isClosed(item)) || wasRecentlyClosed(item.url))

	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	const selectableItemURLs = createMemo(
		() =>
			home.list.items &&
			(flattenTree(home.list.items)
				.filter(selectableItemsFilter)
				.map(i => i.url) as (ActionURL | ProjectURL)[])
	)

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs: selectableItemURLs,
	})

	const expander = useExpander<"action">(selection)
	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div class="today page-container page-container--built-in">
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">🎁</div>
						<span class="page-title__title">Someday</span>
					</h1>

					<main class="page-content">
						<For each={home.list.items}>
							{item => (
								<Switch>
									<Match when={isAction(item) && selectableItemsFilter(item)}>
										<TodayAction
											action={item as Action}
											selection={selection as Selection<ActionURL>}
											expander={expander}
											toggleCompleted={() => toggleCompleted(item as Action)}
											toggleCanceled={() => toggleCanceled(item as Action)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<TodayProject
											project={item as Project}
											selection={selection}
											expander={expander}
											filter={selectableItemsFilter}
											toggleItemCompleted={toggleCompleted}
											toggleItemCanceled={toggleCanceled}
										/>
									</Match>
									{/* todo this might not be right */}
									<Match when={isArea(item)}>
										<Show
											when={
												(item as Area).items.filter(selectableItemsFilter)
													.length
											}>
											<Switch>
												<Match when={isProject(item)}>
													<TodayProject
														project={item as Project}
														selection={selection}
														expander={expander}
														filter={selectableItemsFilter}
														toggleItemCompleted={toggleCompleted}
														toggleItemCanceled={toggleCanceled}
													/>
												</Match>
												<Match when={isAction(item)}>
													<TodayAction
														action={item as Action}
														selection={selection as Selection<ActionURL>}
														expander={expander}
														toggleCompleted={() =>
															toggleCompleted(item as Action)
														}
														toggleCanceled={() =>
															toggleCanceled(item as Action)
														}
													/>
												</Match>
											</Switch>
										</Show>
										<h3>{item.title}</h3>
										<ActionList
											actions={(item as Area).items
												.filter(isAction)
												.filter(selectableItemsFilter)}
											selection={selection}
											isSelected={selection.isSelected}
											{...expander}
											toggleCanceled={() => {}}
											toggleCompleted={() => {}}
										/>
									</Match>
								</Switch>
							)}
						</For>
					</main>
				</div>
				<DevelopmentNote problems="Drag and drop doesn't yet reörder items on the Today page" />
			</div>
		</DragAndDropProvider>
	)
}
