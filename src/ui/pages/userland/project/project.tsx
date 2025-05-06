import "./project.css"
import {createMemo, createSignal, For, onCleanup, Suspense} from "solid-js"
import {useLocation, useParams} from "@solidjs/router"
import type {ProjectURL} from "::domain/project.ts"
import NotesEditor from "::ui/components/text-editor/editors/notes-editor.tsx"
import TitleEditor from "::ui/components/text-editor/editors/title-editor.tsx"
import EmojiPicker from "::ui/components/emoji-picker.tsx"
import Action, {
	type ExpandableProps,
	type SelectableProps,
} from "::components/actions/action.tsx"
import {Switch} from "solid-js"
import {Match} from "solid-js"
import {type ActionViewModel} from "::viewmodel/action.ts"
import {useSelectionHotkeys} from "::ui/pages/standard/inbox.tsx"
import ActionList from "::components/actions/action-list.tsx"
import {type HeadingViewModel} from "::viewmodel/heading.ts"
import {isHeading, newHeading, type HeadingURL} from "::domain/heading.ts"
import {curl} from "::infra/sync/automerge-repo.ts"
import {type Reference, type ReferencePointer} from "::domain/reference.ts"
import {usePageContext, type Expander} from "::viewmodel/helpers/page.ts"
import {isAction, newAction, type ActionURL} from "::domain/action.ts"
import {useProject, type ProjectViewModel} from "::viewmodel/project.ts"
import {isClosed} from "::domain/generic/doable.ts"
import {type SelectionContext} from "::infra/hooks/selection-context.ts"
import {Show} from "solid-js"
import bemby from "bemby"
import {DragAndDropProvider, useDragAndDrop} from "::infra/dnd/dnd-context.ts"
import debug from "debug"
import {createEffect} from "solid-js"
import {
	getDraggedPayload,
	getDropTargetIndex,
	getInput,
	type DragAndDropItem,
	type DraggableContract,
} from "::infra/dnd/contract.ts"
import {getType} from "::infra/type-registry.ts"
import {getParentURL} from "../../../../infra/parent-registry.ts"
import useClickOutside from "solid-click-outside"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {useViewModel} from "../../../../viewmodel/useviewmodel.ts"
import {createRoot} from "solid-js"
import {useHomeContext} from "../../../../viewmodel/home.ts"
import {Button} from "@kobalte/core/button"

const log = debug("nextaction:project")

export default function Project() {
	const home = useHomeContext()
	const params = useParams<{projectId: ProjectURL}>()
	const project = useProject(() => params.projectId)
	const {
		selection,
		expander,
		stage,
		selectableItemURLs,
		dnd,
		commandRegistry,
		filter,
	} = usePageContext({
		items: () => project.items,
		selectableItemFilter: item =>
			item &&
			((isHeading(item) && !item.archived) ||
				(isAction(item) && !item.deleted && !isClosed(item))),
	})

	const titleExtension = () => project.titleSyncExtension
	const notesExtension = () => project.notesSyncExtension

	useSelectionHotkeys({selection, selectableItemURLs})

	commandRegistry.setCommands({
		"new-action": {
			id: "new-action",
			label: "New action",
			shortcut: "space",
			exe: () => {
				const newActionURL = curl<ActionURL>(newAction())
				project.addItem("action", newActionURL)
				expander.expand(newActionURL)
				return {}
			},
		},
		"new-heading": {
			id: "new-heading",
			label: "New heading",
			exe: () => {
				const newHeadingURL = curl<HeadingURL>(newHeading())
				project.addItem("heading", newHeadingURL)
				expander.expand(newHeadingURL)
				return {}
			},
		},
		delete: {
			id: "delete",
			label: "Delete item",
			shortcut: "backspace",
			exe: () => {
				const selected = selection.selected()
				if (selected.length) {
					for (const url of selected) {
						const item = project.items.find(i => i.url == url)
						if (item) {
							if (isAction(item)) {
								item.delete()
							} else if (isHeading(item)) {
								item.toggleArchived(true)
							}
						}
					}
					selection.clearSelected()
				}
				return {}
			},
		},
	})

	const inHome = createMemo(() => {
		// return home.list.itemURLs.includes(project.url)
		return !!home.keyed[project.url]
	})

	const toggleCompleted = (item: ActionViewModel, force?: boolean) => {
		stage(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: ActionViewModel, force?: boolean) => {
		stage(() => item.toggleCanceled(force), item.url)
	}

	const toggleArchived = (item: HeadingViewModel, force?: boolean) => {
		stage(() => item.toggleArchived(force), item.url)
	}

	return (
		<Suspense>
			<DragAndDropProvider value={dnd}>
				<div
					on:click={event => {
						if (
							event.target.closest(".action") ||
							event.target.closest(".project-heading")
						) {
							return
						}
						selection.clearSelected()
					}}
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
									items: selectableItemURLs,
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
										i =>
											i.type == "action" && !headings.find(h => h.url == i.url)
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
					<div class="page">
						<Show when={log.enabled}>
							<h1 class="page-title">
								<code>{project.url}</code>
							</h1>
						</Show>

						<h1 class="page-title">
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

							<Show when={!inHome()}>
								<Button
									class="button page-title__add-to-sidebar"
									onClick={() => home.list.addItem("project", project.url)}>
									Add to sidebar
								</Button>
							</Show>

							<Show when={project.deleted}>
								<Button
									class="button"
									onClick={() => (project.deleted = false)}>
									Undelete
								</Button>
							</Show>
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
															addSelected={() =>
																selection.addSelected(item.url)
															}
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
															selection={
																selection as SelectionContext<ActionURL>
															}
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
															addSelected={() =>
																selection.addSelected(item.url)
															}
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
		</Suspense>
	)
}

function ProjectHeading(
	props: {
		heading: HeadingViewModel
		toggleCanceled: (item: ActionViewModel, force?: boolean) => void
		toggleCompleted: (item: ActionViewModel, force?: boolean) => void
		toggleArchived: (item: HeadingViewModel, force?: boolean) => void
		filter: (item: ActionViewModel) => boolean
		expander: Expander<"action">
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
								view.dom.scrollIntoView({behavior: "smooth", block: "nearest"})
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

/** // todo
 * createEventListener<{copy: ClipboardEvent}>(globalThis, "copy", event => {
		if (selection.selected().length) {
			event.clipboardData?.setData(
				"text/plain",
				selection
					.selected()
					.map(i => {
						return itemViewModels()
							?.find(url => url.url == i)
							?.toString()
							.trim()
					})
					.join("\n")
			)
			event.preventDefault()
		}
	})

	createEventListener<{paste: ClipboardEvent}>(
		globalThis,
		"paste",
		async event => {
			if (!selection.selected().length) {
				const text = await navigator.clipboard.readText()
				// todo use a markdown parser
				const items = text.split("\n").map(i => {
					i = i.trim()
					const actionMatch = i.match(/- \[([ xX])\] /)
					if (actionMatch) {
						return {
							type: "action" as const,
							title: i.replace(/- \[([ xX])\] /, ""),
							state: actionMatch[1].trim()
								? ("completed" as const)
								: ("open" as const),
						}
					}
					const headingMatch = i.match(/#+ (.+)/)
					if (headingMatch) {
						return {
							type: "heading" as const,
							title: headingMatch[1].trim(),
						}
					}
				})

				if (items.length) {
					event.preventDefault()
					event.stopPropagation()
					event.stopImmediatePropagation()
				}
				let currentTarget = project as ProjectViewModel | HeadingViewModel

				for (const item of items) {
					if (!item) continue
					if (item.type == "heading") {
						const headingURL = curl<HeadingURL>(newHeading({title: item.title}))
						currentTarget = useHeading(() => headingURL)
						project.addItem("heading", headingURL)
					} else if (item.type == "action") {
						const actionURL = curl<ActionURL>(
							newAction({title: item.title, state: item.state})
						)
						currentTarget.addItem("action", actionURL)
					}
				}
			}
		}
	)
 */
