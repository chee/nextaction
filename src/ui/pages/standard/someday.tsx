// import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {useSelectionHotkeys} from "./inbox.tsx"
import {useHome} from "@/viewmodel/home.ts"
import {useExpander, useRecentlyRemoved} from "@/viewmodel/helpers/page.ts"
import {isProject, type ProjectURL} from "@/domain/project.ts"
import {isAction, type ActionURL} from "@/domain/action.ts"
import {isClosed, isSomeday} from "@/domain/generic/doable.ts"
import {isActionViewModel, type ActionViewModel} from "@/viewmodel/action.ts"
import {isProjectViewModel, type ProjectViewModel} from "@/viewmodel/project.ts"
import {createMemo, For, Switch, Match, Show} from "solid-js"
import flattenTree from "@/infra/lib/flattenTree.ts"
import {
	createSelectionContext,
	type SelectionContext,
} from "@/infra/hooks/selection-context.ts"
import {TodayAction} from "../today/today-action.tsx"
import {TodayProject} from "../today/today-project.tsx"
import {isAreaViewModel, type AreaViewModel} from "@/viewmodel/area.ts"
import {
	createDragAndDropContext,
	DragAndDropContext,
	DragAndDropProvider,
} from "../../../infra/dnd/dnd-context.ts"
import DevelopmentNote from "../../components/development-note.tsx"

export default function Someday() {
	const home = useHome()
	const [wasRecentlyClosed, recentlyClose] = useRecentlyRemoved()

	const selectableItemsFilter = (item: (typeof home.list.items)[number]) =>
		(isProject(item) || isAction(item)) &&
		isSomeday(item) &&
		((!item.deleted && !isClosed(item)) || wasRecentlyClosed(item.url))

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

	const selectableItemURLs = createMemo(
		() =>
			flattenTree(home.list.items)
				.filter(selectableItemsFilter)
				.map(i => i.url) as (ActionURL | ProjectURL)[]
	)

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs: selectableItemURLs,
	})

	const expander = useExpander<ActionURL>(selection)
	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div class="today page-container page-container--built-in">
				{/* <Bar>
					<BarNewAction
						selection={today.selection}
						expand={url => today.expand(url)}
						newAction={today.newAction}
					/>
					<BarMenu />
				</Bar> */}
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">🎁</div>
						<span class="page-title__title">Someday</span>
					</h1>

					<main class="page-content">
						<For each={home.list.items}>
							{item => (
								<Switch>
									<Match
										when={
											isActionViewModel(item) && selectableItemsFilter(item)
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
										<TodayProject
											project={item as ProjectViewModel}
											selection={selection}
											expander={expander}
											filter={selectableItemsFilter}
											toggleItemCompleted={toggleCompleted}
											toggleItemCanceled={toggleCanceled}
										/>
									</Match>
									{/* todo this might not be right */}
									<Match when={isAreaViewModel(item)}>
										<Show
											when={
												(item as AreaViewModel).items.filter(
													selectableItemsFilter
												).length
											}>
											<Switch>
												<Match when={isProjectViewModel(item)}>
													<TodayProject
														project={item as ProjectViewModel}
														selection={selection}
														expander={expander}
														filter={selectableItemsFilter}
														toggleItemCompleted={toggleCompleted}
														toggleItemCanceled={toggleCanceled}
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
										<h3>{item.title}</h3>
										<ActionList
											actions={(item as AreaViewModel).items
												.filter(isActionViewModel)
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
