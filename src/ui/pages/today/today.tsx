// import Bar, {BarMenu, BarNewAction} from "::ui/components/bar/bar.tsx"
import {useHomeContext} from "::viewmodel/home.ts"
import {
	isClosed,
	isToday,
	parseIncomingWhen as magicWhen,
} from "::domain/generic/doable.ts"
import {For, Match} from "solid-js"
import {Switch} from "solid-js"
import {isActionViewModel, type ActionViewModel} from "::viewmodel/action.ts"
import {isProjectViewModel, type ProjectViewModel} from "::viewmodel/project.ts"
import {isAction, newAction, type ActionURL} from "::domain/action.ts"
import {
	createSelectionContext,
	type SelectionContext,
} from "::infra/hooks/selection-context.ts"
import {useSelectionHotkeys} from "../standard/inbox.tsx"
import {useExpander, useStagingArea} from "::viewmodel/helpers/page.ts"
import {isProject, newProject, type ProjectURL} from "::domain/project.ts"
import {createMemo} from "solid-js"
import {Show} from "solid-js"
import flattenTree from "::infra/lib/flattenTree.ts"
import {TodayProject} from "./today-project.tsx"
import {TodayAction} from "./today-action.tsx"
import {isAreaViewModel, type AreaViewModel} from "::viewmodel/area.ts"
import Bar, {BarButton, BarNewAction} from "::ui/components/bar/bar.tsx"
import {curl} from "::infra/sync/automerge-repo.ts"
import BigPlus from "::ui/icons/big-plus.tsx"
import {
	getDraggedPayload,
	getDropTargetIndex,
	getInput,
	type DragAndDropItem,
	type DraggableContract,
} from "::infra/dnd/contract.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::infra/dnd/dnd-context.ts"
import {mapArray} from "solid-js"
import {getParentURL} from "::infra/parent-registry.ts"
import {getType} from "::infra/type-registry.ts"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {onCleanup} from "solid-js"
import DevelopmentNote from "../../components/development-note.tsx"
import type {AreaURL} from "../../../domain/area.ts"

export default function Today() {
	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useStagingArea()

	const filter = (item: (typeof home.list.items)[number]) =>
		(isProject(item) || isAction(item)) &&
		isToday(item) &&
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

	const today = createMemo(
		() =>
			flattenTree(home.list.items).filter(filter) as (
				| ActionViewModel
				| ProjectViewModel
			)[]
	)

	const todayURLs = mapArray(today, i => i.url)

	const selection = createSelectionContext(() => todayURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs: todayURLs,
	})
	const expander = useExpander<ActionURL>(selection)

	// todo a TodayDropTargetViewModel that can be used by this page and the
	// sidebar button
	// todo remove selection when click on page background

	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div
				class="today page-container page-container--built-in"
				ref={element => {
					const clean = dropTargetForElements({
						element,
						onDrop(payload) {
							// const input = getInput(payload)
							const dragged = getDraggedPayload(payload)
							if (!dragged) return

							// const includesHeading = dragged.items.some(
							// 	i => i.type == "heading"
							// )

							// const {isAbove, dropTargetURL} = getDropTargetIndex({
							// 	element: element,
							// 	input,
							// 	items: todayURLs,
							// 	dragged,
							// 	isValidDropTarget: isValidDropTarget,
							// })

							// const dropTargetType = getType(dropTargetURL) as
							// | "action"
							// | "project"

							// const dropTargetRef: ReferencePointer<"project" | "action"> = {
							// type: dropTargetType,
							// url: dropTargetURL,
							// above: isAbove,
							// }
							// createRoot(() => {
							// 	for (const [parentURL, groupedItems] of Object.entries(
							// 		Object.groupBy(dragged.items, key => getParentURL(key.url))
							// 	)) {
							// 		const currentParentType = getType(
							// 			parentURL as ProjectURL | AreaURL | HomeURL
							// 		)
							// 		if (currentParentType == "home") {
							// 			home.list.removeItemByRef(
							// 				groupedItems as typeof home.list.items
							// 			)
							// 		} else if (["project", "area"].includes(currentParentType)) {
							// 			const parentViewModel = useViewModel(() => ({
							// 				type: currentParentType as "project" | "area",
							// 				url: parentURL,
							// 			})) as ProjectViewModel | AreaViewModel
							// 			if (parentViewModel) {
							// 				if (groupedItems) {
							// 					parentViewModel.removeItemByRef(
							// 						groupedItems as typeof parentViewModel.items
							// 					)
							// 				}
							// 			}
							// 		}
							// 	}

							// })
						},
						onDrag(payload) {
							const dragged = getDraggedPayload(payload)
							const input = getInput(payload)

							if (!dragged) return

							const {dropTargetElement, isAbove, dropTargetURL} =
								getDropTargetIndex({
									element: element,
									input,
									items: todayURLs,
									dragged,
									isValidDropTarget: isValidDropTarget,
								})
							const dropTargetType = getType(dropTargetURL)
							if (dropTargetElement) {
								console.log(
									"dropTargetElement",
									dropTargetElement,
									dropTargetType
								)
								dropTargetElement.dataset.droptarget = isAbove
									? "above"
									: "below"
								// if (dropTargetType == "heading") {
								// 	dropTargetElement.dataset.droptarget = headingIsDragged
								// 		? isAbove
								// 			? "above"
								// 			: "below"
								// 		: "true"
								// } else {
								// 	dropTargetElement.dataset.droptarget = isAbove
								// 		? "above"
								// 		: "below"
								// }
							}
						},
					})
					onCleanup(clean)
				}}>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">✨</div>
						<span class="page-title__title">Today</span>
					</h1>
					<main class="page-content">
						<For each={home.list.items}>
							{item => (
								<Switch>
									<Match when={isActionViewModel(item) && filter(item)}>
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
											filter={filter}
											toggleItemCompleted={toggleCompleted}
											toggleItemCanceled={toggleCanceled}
										/>
									</Match>
									{/* todo this might not be right */}
									<Match when={isAreaViewModel(item)}>
										<Show
											when={
												(item as AreaViewModel).items.filter(filter).length
											}>
											<Switch>
												<Match when={isProjectViewModel(item)}>
													<TodayProject
														project={item as ProjectViewModel}
														selection={selection}
														expander={expander}
														filter={filter}
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
										{/* todo this shouldnt be here, right?
											an area can't be today <h3>{item.title}</h3>
											<ActionList
												actions={(item as AreaViewModel).items
													.filter(isActionViewModel)
													.filter(filter)}
												selection={selection}
												isSelected={selection.isSelected}
												{...expander}
												toggleCanceled={() => {}}
												toggleCompleted={() => {}}
											/> */}
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

function isValidDropTarget(
	potentialDropTarget: DragAndDropItem,
	dragged: DraggableContract
) {
	if (dragged.items.some(i => i.type == "project")) {
		const dropParent = getParentURL(
			potentialDropTarget.url as ProjectURL | ActionURL | AreaURL
		)
		const dropParentType = getType(dropParent)
		if (dropParentType == "project") {
			return false
		}
		return (
			potentialDropTarget.type == "area" ||
			potentialDropTarget.type == "project"
		)
	}
	return true
}
