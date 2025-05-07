import "./project.css"
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	Show,
	Suspense,
} from "solid-js"
import {useLocation, useParams} from "@solidjs/router"
import NotesEditor from "::ui/components/text-editor/editors/notes-editor.tsx"
import TitleEditor from "::ui/components/text-editor/editors/title-editor.tsx"
import EmojiPicker from "::ui/components/emoji-picker.tsx"

import {Switch, Match, createRoot} from "solid-js"
import useClickOutside from "solid-click-outside"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {Button} from "@kobalte/core/button"
import debug from "debug"
import {useHomeContext} from "::domain/entities/useHome.ts"
import type {ProjectRef, ProjectURL} from "::shapes/project.ts"
import {createActionShape, type ActionURL} from "::shapes/action.ts"
import {
	isHeading,
	HeadingURL,
	createHeadingShape,
	type HeadingRef,
} from "::shapes/heading.ts"
import {isClosed} from "::shapes/mixins/doable.ts"
import {
	type ReferencePointer,
	type Reference,
	point,
} from "::shapes/reference.ts"
import {curl} from "::core/sync/automerge.ts"
import {
	getInput,
	getDraggedPayload,
	getDropTargetIndex,
	DragAndDropItem,
	DraggableContract,
} from "::domain/dnd/contract.ts"
import {DragAndDropProvider, useDragAndDrop} from "::domain/dnd/dnd-context.ts"
import {isAction, type Action} from "::domain/entities/useAction.ts"
import type {Heading} from "::domain/entities/useHeading.ts"
import {useProject, type Project} from "::domain/entities/useProject.ts"
import {usePageContext} from "::domain/page/page-context.ts"
import {getParentURL} from "::domain/registries/parent-registry.ts"
import {getType} from "::domain/registries/type-registry.ts"
import type {Expander, ExpandableProps} from "::domain/state/useExpander.ts"
import type {SelectableProps, Selection} from "::domain/state/useSelection.ts"
import ActionList from "../../../components/actions/action-list.tsx"
import ActionItem from "../../../components/actions/action.tsx"
import bemby from "bemby"
import {useSelectionHotkeys} from "../../standard/inbox.tsx"
import type {AnyChildType} from ":concepts:"
import {useEntity} from "::domain/useDomainEntity.ts"

const log = debug("nextaction:project")

export default function ProjectView() {
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
				const newActionURL = curl<ActionURL>(createActionShape())
				project.addItem("action", newActionURL)
				expander.expand(newActionURL)
				return {}
			},
		},
		"new-heading": {
			id: "new-heading",
			label: "New heading",
			exe: () => {
				const newHeadingURL = curl<HeadingURL>(createHeadingShape())
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

	const toggleCompleted = (item: Action, force?: boolean) => {
		stage(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: Action, force?: boolean) => {
		stage(() => item.toggleCanceled(force), item.url)
	}

	const toggleArchived = (item: Heading, force?: boolean) => {
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
								const dragged = getDraggedPayload<"action" | "heading">(payload)
								if (!dragged) return
								const includesHeading = dragged.items.some(
									i => i.type == "heading"
								)
								const {isAbove, dropTargetURL} = getDropTargetIndex<"project">({
									element: element,
									input,
									items: selectableItemURLs,
									dragged,
									isValidDropTarget: isValidDropTarget,
								})

								const dropTargetType = getType(dropTargetURL) as
									| "heading"
									| "project"
									| "action"

								const dropTargetRef = point(
									dropTargetType,
									dropTargetURL,
									isAbove
								)

								const parentURL = includesHeading
									? project.url
									: dropTargetType == "action"
									? getParentURL(dropTargetURL)
									: dropTargetURL

								const parentType = getType(parentURL) as "project" | "heading"
								const parentRef = {
									type: parentType,
									url: parentURL,
								} as ProjectRef | HeadingRef
								createRoot(() => {
									// todo this is a utility funciton
									for (const [parentURL, items] of Object.entries(
										Object.groupBy(dragged.items, key => getParentURL(key.url))
									)) {
										const parentType = getType(
											parentURL as ProjectURL | HeadingURL
										)
										const parentViewModel = useEntity(() => ({
											type: parentType,
											url: parentURL as ProjectURL | HeadingURL,
										})) as Project | Heading
										if (items) {
											parentViewModel.removeItemByRef(
												items as DragAndDropItem<"action">[]
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

									if (dropTargetRef.type == "project") {
										project.addItemByRef(
											headings,
											isAbove ? 0 : project.items.length
										)
										if (rest.length) {
											const newParent = useEntity(() => parentRef) as
												| Project
												| Heading

											newParent.addItemByRef(
												rest,
												isAbove ? 0 : newParent.items.length
											)
										}
									} else if (dropTargetRef.type == "heading") {
										// todo discriminated union not working
										project.addItemByRef(
											headings,
											dropTargetRef as
												| ReferencePointer<"action">
												| ReferencePointer<"heading">
										)
										if (rest.length) {
											const newParent = useEntity(() => parentRef) as
												| Project
												| Heading

											newParent.addItemByRef(
												rest,
												dropTargetRef as ReferencePointer<"action">
											)
										}
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
										items: selectableItemURLs,
										// @ts-expect-error todo
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
											<Switch>
												<Match when={item.type == "action"}>
													<ActionItem
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
														{...(item as Action)}
														toggleCanceled={(force?: boolean) =>
															toggleCanceled(item as Action, force)
														}
														toggleCompleted={(force?: boolean) =>
															toggleCompleted(item as Action, force)
														}
													/>
												</Match>
												<Match when={item.type == "heading"}>
													<ProjectHeading
														heading={item as Heading}
														selection={selection as Selection<ActionURL>}
														expander={expander as Expander<"action">}
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
		heading: Heading
		toggleCanceled: (item: Action, force?: boolean) => void
		toggleCompleted: (item: Action, force?: boolean) => void
		toggleArchived: (item: Heading, force?: boolean) => void
		filter: (item: Action) => boolean
		expander: Expander<"action">
		selection: Selection<ActionURL>
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
								view.dom.scrollIntoView({behavior: "instant"})
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
	item: DragAndDropItem<AnyChildType>,
	dragged: DraggableContract<AnyChildType>
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
				let currentTarget = project as Project | Heading

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
