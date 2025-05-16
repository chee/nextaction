import "./project.css"
import {createEffect, createMemo, createSignal, For, Show} from "solid-js"
import {useLocation, useParams} from "@solidjs/router"
import NotesEditor from "::ui/components/text-editor/editors/notes-editor.tsx"
import TitleEditor from "::ui/components/text-editor/editors/title-editor.tsx"
import EmojiPicker from "::ui/components/emoji-picker.tsx"

import {Switch, Match} from "solid-js"
import {Button} from "@kobalte/core/button"
import debug from "debug"
import type {AreaURL} from "::shapes/area.ts"
import {isClosed, isSomeday} from "::shapes/mixins/doable.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import ActionItem from "../../components/actions/action.tsx"
import {getSelectionProps} from "::viewmodels/selection/useSelection.ts"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"

import {
	createDeleteCommand,
	createNewActionCommand,
	createCancelCommand,
	createCompleteCommand,
	createNewProjectInAreaCommand,
} from "::viewmodels/commands/standard.ts"
import {on} from "solid-js"
import {useArea} from "::domain/useArea.ts"
import {ProjectItem} from "../../components/projects/project-item.tsx"

const log = debug("nextaction:area")

export default function AreaView() {
	const home = useHomeContext()
	const params = useParams<{areaId: AreaURL}>()
	const [viewingSomeday, setViewingSomeday] = createSignal(false)
	const area = useArea(() => params.areaId)
	const page = usePageContext({
		items: () => area.items,
		selectableItemFilter: item => {
			if (!item) return false
			if (isProject(item)) {
				return (
					!item.deleted &&
					!isClosed(item) &&
					(!viewingSomeday() || isSomeday(item))
				)
			}
			if (isAction(item)) {
				return (
					!item.deleted &&
					!isClosed(item) &&
					(!viewingSomeday() || isSomeday(item))
				)
			}
			return false
		},
	})
	const {selection, expander, stage, dnd, filter} = page

	const commandRegistry = useCommandRegistry()

	createEffect(
		on(
			() => params.areaId,
			areaURL => {
				commandRegistry.addCommand(
					createNewActionCommand({
						fallbackURL: areaURL,
						selection,
						expander,
					})
				)

				commandRegistry.addCommand(
					createNewProjectInAreaCommand({
						selection,
						areaURL,
					})
				)
				commandRegistry.addCommand(createDeleteCommand({selection}))
				commandRegistry.addCommand(createCompleteCommand({selection, stage}))
				commandRegistry.addCommand(createCancelCommand({selection, stage}))
			}
		)
	)

	const titleExtension = () => area.titleSyncExtension
	const notesExtension = () => area.notesSyncExtension

	const inHome = createMemo(() => {
		// return home.list.itemURLs.includes(project.url)
		return !!home.keyed[area.url]
	})

	// todo this should issue a command
	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		stage(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		stage(() => item.toggleCanceled(force), item.url)
	}

	const visibleItems = createMemo(() => area.items.filter(filter))

	return (
		<DragAndDropProvider value={dnd}>
			<div
				on:click={event => {
					if (
						event.target.closest(".action") ||
						event.target.closest(".project-item")
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
							<code>{area.url}</code>
						</h1>
					</Show>

					<h1 class="page-title">
						<EmojiPicker
							icon={area.icon}
							modifiers={["area-title", "page-title"]}
							onEmoji={emoji => (area.icon = emoji)}
						/>

						<TitleEditor
							doc={area.title}
							blur={() => {}}
							placeholder="project"
							syncExtension={titleExtension()}
							modifiers="project"
							submit={() => {}}
							withView={view => {
								const state = useLocation().state as {isNew?: boolean}
								if (state?.isNew) {
									setTimeout(() => view.focus(), 150)
								}
							}}
						/>

						<Show when={!inHome()}>
							<Button
								class="button page-title__add-to-sidebar"
								onClick={() => home.list.addItem("area", area.url)}>
								Add to sidebar
							</Button>
						</Show>

						<Show when={area.deleted}>
							<Button class="button" onClick={() => (area.deleted = false)}>
								Undelete
							</Button>
						</Show>
					</h1>

					<main class="page-content">
						<NotesEditor
							doc={area.notes}
							blur={() => {}}
							placeholder="Notes"
							syncExtension={notesExtension()}
							modifiers="project"
						/>

						<Show
							when={visibleItems().length}
							fallback={
								<div class="list-empty">Press ⌃⌘N to create a new action.</div>
							}>
							<For each={visibleItems()}>
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
												<Match when={item.type == "project"}>
													<ProjectItem
														modifiers="in-area"
														{...(item as Project)}
														{...getSelectionProps(selection, item.url)}
													/>
												</Match>
											</Switch>
										</Show>
									)
								}}
							</For>
						</Show>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}
