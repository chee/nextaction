import "./project.css"
import {createEffect, createMemo, createSignal, For, Show} from "solid-js"
import {useLocation, useParams} from "@solidjs/router"
import NotesEditor from "::ui/components/text-editor/editors/notes-editor.tsx"
import TitleEditor from "::ui/components/text-editor/editors/title-editor.tsx"
import EmojiPicker from "::ui/components/emoji-picker.tsx"

import {Switch, Match} from "solid-js"
import useClickOutside from "solid-click-outside"
import {Button} from "@kobalte/core/button"
import debug from "debug"
import type {ProjectURL} from "::shapes/project.ts"
import {type ActionURL} from "::shapes/action.ts"
import {isHeadingShape} from "::shapes/heading.ts"
import {isClosed} from "::shapes/mixins/doable.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {useProject} from "::domain/useProject.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {
	DragAndDropProvider,
	useDragAndDrop,
} from "::viewmodels/dnd/dnd-context.ts"
import type {Heading} from "::domain/useHeading.ts"
import ActionItem from "../../components/actions/action.tsx"
import type {
	ActionExpander,
	ExpandableProps,
} from "::viewmodels/selection/useExpander.ts"
import type {
	SelectableProps,
	SelectionContext,
} from "::viewmodels/selection/useSelection.ts"
import bemby from "bemby"
import ActionList from "../../components/actions/action-list.tsx"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"

import {
	createDeleteCommand,
	createNewHeadingCommand,
	createNewActionCommand,
	createCancelCommand,
	createCompleteCommand,
} from "::viewmodels/commands/standard.ts"
import {on} from "solid-js"

const log = debug("nextaction:project")

export default function ProjectView() {
	const home = useHomeContext()
	const params = useParams<{projectId: ProjectURL}>()
	const project = useProject(() => params.projectId)
	const {selection, expander, stage, dnd, filter} = usePageContext({
		items: () => project.items,
		selectableItemFilter: item => {
			if (!item) return false
			if (isHeadingShape(item)) {
				return !item.archived
			}
			if (isAction(item)) {
				return !item.deleted && !isClosed(item)
			}
			return false
		},
	})

	const commandRegistry = useCommandRegistry()

	createEffect(
		on(
			() => params.projectId,
			projectURL => {
				commandRegistry.addCommand(
					createNewActionCommand({
						fallbackURL: projectURL,
						selection,
						expander,
					})
				)
				commandRegistry.addCommand(
					createNewHeadingCommand({
						projectURL,
						selection,
						expander,
					})
				)
				commandRegistry.addCommand(createDeleteCommand({selection}))
				commandRegistry.addCommand(createCompleteCommand({selection, stage}))
				commandRegistry.addCommand(createCancelCommand({selection, stage}))
			}
		)
	)

	const titleExtension = () => project.titleSyncExtension
	const notesExtension = () => project.notesSyncExtension

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
				ref={element => dnd.createDraggableList(element)}>
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
							<Button class="button" onClick={() => (project.deleted = false)}>
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
													selection={selection}
													expander={expander}
													toggleCanceled={toggleCanceled}
													toggleCompleted={toggleCompleted}
													toggleArchived={toggleArchived}
													filter={filter}
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
	)
}

function ProjectHeading(
	props: {
		heading: Heading
		toggleCanceled: (item: Action, force?: boolean) => void
		toggleCompleted: (item: Action, force?: boolean) => void
		toggleArchived: (item: Heading, force?: boolean) => void
		filter: (item: Action) => boolean
		expander: ActionExpander
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
								setTimeout(() => {
									view.dom.scrollIntoView({
										behavior: "smooth",
										block: "center",
									})
								}, 140)
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

/** // todo
 * createEventListener<{copy: ClipboardEvent}>(globalThis, "copy", event => {
		if (selection.selected().length) {
			event.clipboardData?.setData(
				"text/plain",
				selection
					.selected()
					.map(i => {
						return items()
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
