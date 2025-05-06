import {For, Switch, Match, Show, createMemo, mapArray} from "solid-js"
import {isAction, type ActionURL} from "../../../domain/action.ts"
import {useSelectionHotkeys} from "./inbox.tsx"
import {useHomeContext} from "../../../viewmodel/home.ts"
import {
	useExpander,
	useRecentlyRemoved,
} from "../../../viewmodel/helpers/page.ts"
import {isAnytime, isClosed} from "../../../domain/generic/doable.ts"
import {
	isActionViewModel,
	type ActionViewModel,
} from "../../../viewmodel/action.ts"
import flattenTree from "../../../infra/lib/flattenTree.ts"
import {
	createSelectionContext,
	type SelectionContext,
} from "../../../infra/hooks/selection-context.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "../../../infra/dnd/dnd-context.ts"
import {TodayAction} from "../today/today-action.tsx"
import {
	isProjectViewModel,
	type ProjectViewModel,
} from "../../../viewmodel/project.ts"
import {GroupedProject} from "../../components/projects/grouped-project.tsx"
import {isAreaViewModel, type AreaViewModel} from "../../../viewmodel/area.ts"

export default function Anytime() {
	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useRecentlyRemoved()

	const selectableItemFilter = (item: (typeof home.list.items)[number]) =>
		isAction(item) &&
		isAnytime(item) &&
		((!item.deleted && !isClosed(item)) || wasRecentlyClosed(item.url))

	const toggleCompleted = (item: ActionViewModel, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: ActionViewModel, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	const selectableItems = createMemo(
		() =>
			flattenTree(home.list.items).filter(
				selectableItemFilter
			) as ActionViewModel[]
	)

	const selectableItemURLs = mapArray(selectableItems, i => i.url)

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL>({
		selection,
		selectableItemURLs,
	})

	const expander = useExpander<ActionURL>(selection)

	// todo a TodayDropTargetViewModel that can be used by this page and the
	// sidebar button
	// todo remove selection when click on page background

	const dnd = createDragAndDropContext(selection)
	return (
		<DragAndDropProvider value={dnd}>
			<div class="anytime page-container page-container--built-in">
				{/* <Bar>
				<BarNewAction
					selection={page.selection}
					expand={url => page.expand(url as ActionURL)}
					newAction={page.newAction}
				/>
				<BarMenu />
			</Bar> */}
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">🌻</div>
						<span class="page-title__title">Anytime</span>
					</h1>
					<main class="page-content">
						<For each={home.list.items}>
							{item => (
								<Switch>
									<Match
										when={
											isActionViewModel(item) && selectableItemFilter(item)
										}>
										<TodayAction
											action={item as ActionViewModel}
											selection={selection as SelectionContext<ActionURL>}
											expander={expander}
											toggleCompleted={() =>
												toggleCompleted(item as ActionViewModel)
											}
											toggleCanceled={() =>
												toggleCanceled(item as ActionViewModel)
											}
										/>
									</Match>
									<Match when={isProjectViewModel(item)}>
										<GroupedProject
											project={item as ProjectViewModel}
											selection={selection}
											expander={expander}
											filter={selectableItemFilter}
											toggleActionCanceled={toggleCanceled}
											toggleActionCompleted={toggleCompleted}
										/>
									</Match>
									<Match when={isAreaViewModel(item)}>
										<Show
											when={
												(item as AreaViewModel).items.filter(
													selectableItemFilter
												).length
											}>
											<Switch>
												<Match when={isProjectViewModel(item)}>
													<GroupedProject
														project={item as ProjectViewModel}
														selection={selection}
														expander={expander}
														filter={selectableItemFilter}
														toggleActionCompleted={toggleCompleted}
														toggleActionCanceled={toggleCanceled}
													/>
												</Match>
												<Match when={isActionViewModel(item)}>
													<TodayAction
														action={item as ActionViewModel}
														selection={selection as SelectionContext<ActionURL>}
														expander={expander}
														toggleCompleted={() =>
															toggleCompleted(item as ActionViewModel)
														}
														toggleCanceled={() =>
															toggleCanceled(item as ActionViewModel)
														}
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
			</div>
		</DragAndDropProvider>
	)
}
