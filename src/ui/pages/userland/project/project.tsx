import "./project.css"
// import Bar, {BarMenu, BarNewAction} from "@/ui/components/bar/bar.tsx"
import {createMemo, createSignal, For, onCleanup, Suspense} from "solid-js"
import {useLocation, useParams} from "@solidjs/router"
import type {ProjectURL} from "@/domain/project.ts"
import NotesEditor from "@/ui/components/editor/notes-editor.tsx"
import TitleEditor from "@/ui/components/editor/title-editor.tsx"
import EmojiPicker from "@/ui/components/emoji-picker.tsx"
import Action, {
	type ExpandableProps,
	type SelectableProps,
} from "@/ui/components/actions/action.tsx"
import {Switch} from "solid-js"
import {Match} from "solid-js"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import {useSelectionHotkeys} from "@/ui/pages/standard/inbox.tsx"
import {useHotkeys} from "@/infra/lib/hotkeys.ts"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {type HeadingViewModel} from "@/viewmodel/heading.ts"
import {isHeading, newHeading, type HeadingURL} from "@/domain/heading.ts"
import {curl} from "@/infra/sync/automerge-repo.ts"
import {type Reference, type ReferencePointer} from "@/domain/reference.ts"
import {
	useExpander,
	useRecentlyRemoved,
	type Expander,
} from "@/viewmodel/helpers/page.ts"
import {isAction, newAction, type ActionURL} from "@/domain/action.ts"
import {useProject, type ProjectViewModel} from "@/viewmodel/project.ts"
import {isClosed} from "@/domain/generic/doable.ts"
import flattenTree from "@/infra/lib/flattenTree.ts"
import {
	createSelectionContext,
	type SelectionContext,
} from "@/infra/hooks/selection-context.ts"
import {Show} from "solid-js"
import bemby from "bemby"
import {
	createDragAndDropContext,
	DragAndDropProvider,
	useDragAndDrop,
} from "@/infra/dnd/dnd-context.ts"
import debug from "debug"
import {createEffect} from "solid-js"
import {
	getDraggedPayload,
	getDropTargetIndex,
	getInput,
	type DragAndDropItem,
	type DraggableContract,
} from "@/infra/dnd/contract.ts"
import {getType} from "@/infra/type-registry.ts"
import {getParentURL} from "../../../../infra/parent-registry.ts"
import useClickOutside from "solid-click-outside"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import Bar, {BarButton, BarNewAction} from "../../../components/bar/bar.tsx"
import BigPlus from "../../../icons/big-plus.tsx"
import {useViewModel} from "../../../../viewmodel/useviewmodel.ts"
import {createRoot} from "solid-js"

const log = debug("taskpad:project")

export default function Project() {
	const params = useParams<{projectId: ProjectURL}>()
	const project = useProject(() => params.projectId)
	const titleExtension = () => project.titleSyncExtension
	const notesExtension = () => project.notesSyncExtension

	// todo send ephemeral message on delete item
	const [wasRecentlyClosed, recentlyClose] = useRecentlyRemoved()

	const filter = (item: (typeof project.items)[number]) =>
		(item &&
			((isHeading(item) && !item.archived) ||
				(isAction(item) && !item.deleted && !isClosed(item)))) ||
		wasRecentlyClosed(item.url)

	const toggleCompleted = (item: ActionViewModel, force?: boolean) => {
		recentlyClose(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: ActionViewModel, force?: boolean) => {
		recentlyClose(() => item.toggleCanceled(force), item.url)
	}

	const toggleArchived = (item: HeadingViewModel, force?: boolean) => {
		recentlyClose(() => item.toggleArchived(force), item.url)
	}

	const itemViewModels = createMemo(() =>
		flattenTree(project.items).filter(filter)
	)

	const items = createMemo(
		() => itemViewModels().map(i => i.url) as (ActionURL | HeadingURL)[]
	)

	const selection = createSelectionContext(() => items())

	useSelectionHotkeys<ActionURL | HeadingURL>({
		selection,
		selectableItemURLs: items,
	})

	const expander = useExpander<ActionURL | HeadingURL>(selection)

	useHotkeys("cmd+ctrl+h", () => {
		// // todo move to project viewmodel
		// // project.heading()
		// const index = Math.min(
		// 	selection.bottomSelectedIndex() + 1,
		// 	items().length - 1
		// )
		// const nextHeadingIndex = items().findIndex(
		// 	item => item.type == "heading",
		// 	index
		// )
		// const actionsBelow = items().slice(index, nextHeadingIndex) as ActionURL[]
		// project.removeItem("action", actionsBelow)
		// const url = curl<HeadingURL>(
		// 	newHeading({items: actionsBelow.map(url => refer("action", url))})
		// )
		// project.addItem("heading", url, index)
		// selection.select(url)
	})

	useHotkeys("backspace", () => {
		for (const [parentURL, items] of Object.entries(
			Object.groupBy(
				selection.selected().map(i => {
					return {
						url: i,
						type: getType(i),
						parentURL: getParentURL(i),
						parentType: getType(getParentURL(i)),
					}
				}),
				key => key.parentURL
			)
		)) {
			const parentType = getType(parentURL)
			const parentViewModel = useViewModel(() => ({
				type: parentType as "project" | "heading",
				url: parentURL,
			})) as ProjectViewModel | HeadingViewModel
			if (items) {
				parentViewModel.removeItemByRef(items)
			}
		}
	})

	const dnd = createDragAndDropContext(() => items(), selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div
				class="project page-container"
				ref={element => {
					const clean = dropTargetForElements({
						element,
						onDrop(payload) {
							const input = getInput(payload)
							const dragged = getDraggedPayload(payload)
							if (!dragged) return
							const includesHeading = dragged.items.some(
								i => i.type == "heading"
							)
							const {isAbove, dropTargetURL} = getDropTargetIndex({
								element: element,
								input,
								items,
								dragged,
								isValidDropTarget: isValidDropTarget,
							})

							const dropTargetType = getType(dropTargetURL) as
								| "action"
								| "heading"
							const dropTargetRef: ReferencePointer<"action" | "heading"> = {
								type: dropTargetType,
								url: dropTargetURL,
								above: isAbove,
							}

							const parentURL = includesHeading
								? project.url
								: dropTargetType == "action"
								? getParentURL(dropTargetURL)
								: dropTargetURL

							const parentType = getType(parentURL) as "project" | "heading"
							const parentRef = {
								type: parentType,
								url: parentURL,
							}
							createRoot(() => {
								// todo this is a utility funciton
								for (const [parentURL, items] of Object.entries(
									Object.groupBy(dragged.items, key => getParentURL(key.url))
								)) {
									const parentType = getType(
										parentURL as ProjectURL | HeadingURL
									)
									const parentViewModel = useViewModel(() => ({
										type: parentType as "project" | "heading",
										url: parentURL,
									})) as ProjectViewModel | HeadingViewModel
									if (items) {
										parentViewModel.removeItemByRef(
											items as typeof parentViewModel.items
										)
									}
								}

								const headings = dragged.items.filter(
									i => i.type == "heading"
								) as Reference<"heading">[]
								const rest = dragged.items.filter(
									i => i.type == "action" && !headings.find(h => h.url == i.url)
								) as Reference<"action">[]

								project.addItemByRef(headings, dropTargetRef)

								if (rest.length) {
									const newParent = useViewModel(() => parentRef) as
										| ProjectViewModel
										| HeadingViewModel

									newParent.addItemByRef(rest, dropTargetRef)
								}
							})
						},
						onDragLeave() {
							for (const el of element
								.querySelectorAll("[draggable]")
								.values()) {
								delete (el as HTMLElement).dataset.droptarget
							}
						},
						onDrag(payload) {
							const dragged = getDraggedPayload(payload)
							const input = getInput(payload)

							if (!dragged) return
							const headingIsDragged = dragged.items.some(
								i => i.type == "heading"
							)
							const {dropTargetElement, isAbove, dropTargetURL} =
								getDropTargetIndex({
									element: element,
									input,
									items,
									dragged,
									isValidDropTarget: isValidDropTarget,
								})
							const dropTargetType = getType(dropTargetURL)
							if (dropTargetElement) {
								if (dropTargetType == "heading") {
									dropTargetElement.dataset.droptarget = headingIsDragged
										? isAbove
											? "above"
											: "below"
										: "true"
								} else {
									dropTargetElement.dataset.droptarget = isAbove
										? "above"
										: "below"
								}
							}
						},
					})
					onCleanup(clean)
				}}>
				<Bar>
					<BarNewAction
						newAction={() => {
							createRoot(() => {
								const newActionURL = curl<ActionURL>(newAction())
								const selected = selection.lastSelected()
								const selectedType = getType(selected)
								if (!selected) {
									project.addItem("action", newActionURL)
									expander.expand(newActionURL)
									return
								}
								if (selectedType == "heading") {
									const headingViewModel = useViewModel(() => ({
										type: selectedType as "heading",
										url: selected,
									})) as HeadingViewModel
									headingViewModel.addItem("action", newActionURL)
									expander.expand(newActionURL)
									return
								}
								const parentOfSelected = getParentURL(selected)
								const parentType = getType(parentOfSelected)
								const parentViewModel = useViewModel(() => ({
									type: parentType as "project" | "heading",
									url: parentOfSelected,
								})) as ProjectViewModel | HeadingViewModel

								parentViewModel.addItem(
									"action",
									newActionURL,
									parentViewModel.itemURLs.indexOf(selected) + 1
								)

								expander.expand(newActionURL)
							})
						}}
					/>
					<BarButton
						style={{background: "orange", rotate: "30deg"}}
						icon={<BigPlus />}
						label="new heading"
						onClick={() => {
							createRoot(() => {
								const newHeadingURL = curl<HeadingURL>(newHeading())
								project.addItem("heading", newHeadingURL)
								expander.expand(newHeadingURL)
							})
						}}
					/>
				</Bar>
				<div class="page">
					<Show when={log.enabled}>
						<h1 class="page-title">
							<code>{project.url}</code>
						</h1>
					</Show>
					<h1 class="page-title">
						{/* todo editable title component, share with Area */}
						<EmojiPicker
							icon={project.icon}
							modifiers={["project-title", "page-title"]}
							onEmoji={emoji => (project.icon = emoji)}
						/>

						<TitleEditor
							doc={project.title}
							blur={() => {}}
							placeholder="project"
							syncExtension={titleExtension()}
							modifiers="project"
							submit={() => {}}
							withView={view => {
								const state = useLocation().state as {isNewProject?: boolean}
								if (state?.isNewProject) view.focus()
							}}
						/>
					</h1>

					<main class="page-content">
						<NotesEditor
							doc={project.notes}
							blur={() => {}}
							placeholder="Notes"
							syncExtension={notesExtension()}
							modifiers="project"
						/>

						<For each={project.items.filter(filter)}>
							{item => {
								return (
									<Show when={item}>
										<Suspense>
											<Switch>
												<Match when={item.type == "action"}>
													<Action
														expand={() => expander.expand(item.url)}
														collapse={() => expander.collapse()}
														expanded={expander.isExpanded(item.url)}
														selected={selection.isSelected(item.url)}
														select={() => selection.select(item.url)}
														addSelected={() => selection.addSelected(item.url)}
														removeSelected={() =>
															selection.removeSelected(item.url)
														}
														addSelectedRange={() =>
															selection.addSelectedRange(item.url)
														}
														{...(item as ActionViewModel)}
														toggleCanceled={(force?: boolean) =>
															toggleCanceled(item as ActionViewModel, force)
														}
														toggleCompleted={(force?: boolean) =>
															toggleCompleted(item as ActionViewModel, force)
														}
													/>
												</Match>
												<Match when={item.type == "heading"}>
													<ProjectHeading
														heading={item as HeadingViewModel}
														selection={selection as SelectionContext<ActionURL>}
														expander={expander as Expander<ActionURL>}
														toggleCanceled={toggleCanceled}
														toggleCompleted={toggleCompleted}
														toggleArchived={toggleArchived}
														filter={item => filter(item)}
														expand={() => expander.expand(item.url)}
														collapse={() => expander.collapse()}
														expanded={expander.isExpanded(item.url)}
														selected={selection.isSelected(item.url)}
														select={() => selection.select(item.url)}
														addSelected={() => selection.addSelected(item.url)}
														removeSelected={() =>
															selection.removeSelected(item.url)
														}
														addSelectedRange={() =>
															selection.addSelectedRange(item.url)
														}
													/>
												</Match>
											</Switch>
										</Suspense>
									</Show>
								)
							}}
						</For>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}

function ProjectHeading(
	props: {
		heading: HeadingViewModel
		toggleCanceled: (item: ActionViewModel, force?: boolean) => void
		toggleCompleted: (item: ActionViewModel, force?: boolean) => void
		toggleArchived: (item: HeadingViewModel, force?: boolean) => void
		filter: (item: ActionViewModel) => boolean
		expander: Expander<ActionURL>
		selection: SelectionContext<ActionURL>
	} & ExpandableProps &
		SelectableProps
) {
	const titleExtension = () => props.heading.titleSyncExtension
	const [dismissible, setDismissible] = createSignal<HTMLElement>()
	createEffect(() => {
		if (props.expanded) {
			useClickOutside(dismissible, () => {
				props.collapse()
			})
		}
	})

	const dnd = useDragAndDrop()

	return (
		<div class="project-heading-container">
			<div
				class={bemby("project-heading", {
					current: props.selected,
				})}
				ref={element => {
					dnd.createDraggableListItem(element, () => props.heading.url)
					setDismissible(element)
				}}
				aria-current={props.selected}
				onClick={event => {
					if (event.metaKey) {
						if (props.selected) {
							props.removeSelected()
							event.preventDefault()
							event.stopPropagation()
							event.stopImmediatePropagation()
						} else {
							props.addSelected()
							event.preventDefault()
							event.stopPropagation()
							event.stopImmediatePropagation()
						}
					} else if (event.shiftKey) {
						props.addSelectedRange()
						event.preventDefault()
						event.stopPropagation()
						event.stopImmediatePropagation()
					} else {
						props.select()
						event.preventDefault()
						event.stopPropagation()
						event.stopImmediatePropagation()
					}
				}}>
				<Show when={log.enabled}>
					<h2 class="project-heading__title">
						<code>{props.heading.url}</code>
					</h2>
				</Show>
				<h2 class="project-heading__title" onDblClick={() => props.expand()}>
					<Show
						when={props.expanded}
						fallback={
							<div class="project-heading__title-static">
								{props.heading.title}
							</div>
						}>
						<TitleEditor
							doc={props.heading.title}
							blur={() => props.collapse()}
							placeholder="New heading..."
							syncExtension={titleExtension()}
							modifiers={["project-heading"]}
							submit={() => props.collapse()}
							readonly={() => !props.expanded}
							withView={view => {
								view.focus()
								createEffect(() => {
									if (!props.expanded) {
										view.dom.blur()
									}
								})
							}}
						/>
					</Show>
				</h2>
			</div>

			<ActionList
				{...props.expander}
				actions={props.heading.items.filter(props.filter)}
				isSelected={props.selection.isSelected}
				selection={props.selection}
				modifiers="in-heading"
				toggleCanceled={props.toggleCanceled}
				toggleCompleted={props.toggleCompleted}
			/>
		</div>
	)
}

// todo this should be a function in the contract
const isValidDropTarget = (
	item: DragAndDropItem,
	dragged: DraggableContract
) => {
	if (dragged.items.some(i => i.type == "heading")) {
		return item.type == "heading"
	} else {
		return true
	}
}
