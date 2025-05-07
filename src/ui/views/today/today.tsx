import {useHomeContext} from "::domain/entities/useHome.ts"
import {isProject, type Project} from "::domain/entities/useProject.ts"
import {useStagingArea} from "::domain/state/useStagingArea.ts"
import {isAction, type Action} from "::domain/entities/useAction.ts"
import {isClosed, isToday} from "::shapes/mixins/doable.ts"
import {
	createMemo,
	For,
	mapArray,
	Match,
	onCleanup,
	Show,
	Switch,
} from "solid-js"
import flattenTree from "::core/util/flattenTree.ts"
import {
	createSelectionContext,
	type Selection,
} from "::domain/state/useSelection.ts"
import {useSelectionHotkeys} from "../standard/inbox.tsx"
import {useExpander, type Expander} from "::domain/state/useExpander.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::domain/dnd/dnd-context.ts"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
	getDraggedPayload,
	getDropTargetIndex,
	getInput,
	type DragAndDropItem,
	type DraggableContract,
} from "::domain/dnd/contract.ts"
import {getType} from "::domain/registries/type-registry.ts"
import {TodayAction} from "./today-action.tsx"
import type {ActionURL} from "::shapes/action.ts"
import {TodayProject} from "./today-project.tsx"
import {isArea, type Area} from "::domain/entities/useArea.ts"
import DevelopmentNote from "../../components/development-note.tsx"
import {getParentURL} from "::domain/registries/parent-registry.ts"
import type {ProjectURL} from "::shapes/project.ts"
import type {AreaURL} from "::shapes/area.ts"

export default function TodayView() {
	const home = useHomeContext()
	const [wasRecentlyClosed, recentlyClose] = useStagingArea()

	const filter = (item: (typeof home.list.items)[number]) =>
		(isProject(item) || isAction(item)) &&
		isToday(item) &&
		((!item.deleted && !isClosed(item)) || wasRecentlyClosed(item.url))

	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	const today = createMemo(
		() => flattenTree(home.list.items).filter(filter) as (Action | Project)[]
	)

	const todayURLs = mapArray(today, i => i.url)

	const selection = createSelectionContext(() => todayURLs())

	useSelectionHotkeys({
		selection,
		selectableItemURLs: todayURLs,
	})
	const expander = useExpander(selection)

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
							// 			})) as Project | AreaViewModel
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
									<Match when={isAction(item) && filter(item)}>
										<TodayAction
											action={item as Action}
											selection={selection as Selection<ActionURL>}
											expander={expander as Expander<"action">}
											toggleCompleted={() => toggleCompleted(item as Action)}
											toggleCanceled={() => toggleCanceled(item as Action)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<TodayProject
											project={item as Project}
											selection={selection}
											expander={expander}
											filter={filter}
											toggleItemCompleted={toggleCompleted}
											toggleItemCanceled={toggleCanceled}
										/>
									</Match>
									{/* todo this might not be right */}
									<Match when={isArea(item)}>
										<Show when={(item as Area).items.filter(filter).length}>
											<Switch>
												<Match when={isProject(item)}>
													<TodayProject
														project={item as Project}
														selection={selection}
														expander={expander}
														filter={filter}
														toggleItemCompleted={toggleCompleted}
														toggleItemCanceled={toggleCanceled}
													/>
												</Match>
												<Match when={isAction(item)}>
													<TodayAction
														action={item as Action}
														selection={selection as Selection<ActionURL>}
														expander={expander as Expander<"action">}
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
										{/* todo this shouldnt be here, right?
											an area can't be today <h3>{item.title}</h3>
											<ActionList
												actions={(item as AreaViewModel).items
													.filter(isAction)
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
	potentialDropTarget: DragAndDropItem<"area" | "project" | "action">,
	dragged: DraggableContract<"area" | "project" | "action">
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
