import {type AnyChildURL, type AnyParentURL} from ":concepts:"
import type {SelectionContext} from "../selection/useSelection.ts"
import {createCommand} from "./commands.tsx"
import {getParentURL} from "::registries/parent-registry.ts"
import {createAction, type ActionURL} from "::shapes/action.ts"
import type {ActionExpander, Expander} from "../selection/useExpander.ts"
import {useModelAfterDark} from "::domain/useModel.ts"
import {useAction, type Action} from "::domain/useAction.ts"
import {createProject, type ProjectURL} from "::shapes/project.ts"
import {createHeading, HeadingURL} from "::shapes/heading.ts"
import {getType} from "::registries/type-registry.ts"
import {referAfterDark, type ReferencePointer} from "::shapes/reference.ts"
import {useProject, type Project} from "::domain/useProject.ts"
import type {Heading} from "::domain/useHeading.ts"
import {isDoable} from "::shapes/mixins/doable.ts"
import {useArea} from "::domain/useArea.ts"
import type {AreaURL} from "::shapes/area.ts"
import {access, type MaybeAccessor} from "@solid-primitives/utils"

export function createNewActionCommand(payload: {
	fallbackURL: AnyParentURL
	selection: SelectionContext<AnyChildURL>
	expander: ActionExpander
	template?: MaybeAccessor<Parameters<typeof createAction>[0] | undefined>
}) {
	return createCommand({
		id: "new-action",
		label: "New Action",
		shortcut: "space",
		exe() {
			const bottom =
				payload.selection.lastSelected() ?? payload.expander.expanded()
			const bottomType = getType(bottom)

			let targetParentURL = payload.fallbackURL
			if (bottom) {
				if (bottomType == "heading" && bottom) {
					targetParentURL = bottom as HeadingURL
				} else {
					const target = getParentURL(bottom)
					if (target) {
						targetParentURL = target
					}
				}
			}

			const url = createAction(access(payload.template))

			const parent = useModelAfterDark(targetParentURL)
			if (!parent) {
				console.error("Parent not found", targetParentURL, payload.fallbackURL)
			}
			parent.addItem(
				"action",
				url,
				bottom == null || bottomType == "heading"
					? 0
					: useModelAfterDark(bottom).asReference()
			)
			const index = payload.selection.bottomSelectedIndex()
			payload.expander.expand(url)
			return {
				undo() {
					const action = useAction(() => url)
					parent.removeItemByRef(action.asReference())
				},
				redo() {
					const action = useAction(() => url)
					parent.addItemByRef(action.asReference(), index)
				},
			}
		},
	})
}

export function createNewProjectInAreaCommand(payload: {
	areaURL: AreaURL
	selection: SelectionContext<AnyChildURL>
	template?: MaybeAccessor<Parameters<typeof createProject>[0]>
}) {
	return createCommand({
		id: "new-project",
		label: "New Project",
		shortcut: "cmd+ctrl+p",
		exe() {
			const bottom = payload.selection.lastSelected()

			const url = createProject(access(payload.template))

			const area = useArea(() => payload.areaURL)
			area.addItem(
				"project",
				url,
				bottom == null ? 0 : useModelAfterDark(bottom).asReference()
			)
			const index = payload.selection.bottomSelectedIndex()

			return {
				undo() {
					const project = useProject(() => url)
					area.removeItemByRef(project.asReference())
				},
				redo() {
					const project = useProject(() => url)
					area.addItemByRef(project.asReference(), index)
				},
			}
		},
	})
}

export function createNewHeadingCommand(payload: {
	projectURL: ProjectURL
	selection: SelectionContext<ActionURL | HeadingURL>
	expander: Expander<"heading" | "action">
	template?: MaybeAccessor<Parameters<typeof createHeading>[0]>
}) {
	const parent = useProject(() => payload.projectURL)
	return createCommand({
		id: "new-heading",
		label: "New Heading",
		shortcut: "cmd+ctrl+h",
		exe() {
			const sel = payload.selection.lastSelected()
			let targetIndex =
				(sel &&
					(referAfterDark(sel) as
						| ReferencePointer<"heading">
						| ReferencePointer<"action">)) ??
				0
			if (
				targetIndex?.type == "action" &&
				getType(getParentURL(sel)) == "heading"
			) {
				targetIndex = referAfterDark(getParentURL(sel) as HeadingURL) as
					| ReferencePointer<"heading">
					| ReferencePointer<"action">
			}

			const url = createHeading(access(payload.template))

			parent.addItem(
				"heading",
				url,
				sel == null ? 0 : useModelAfterDark(sel).asReference()
			)

			payload.expander.expand(url)
			return {
				undo() {
					const action = useAction(() => url)
					parent.removeItemByRef(action.asReference())
				},
				redo() {
					const action = useAction(() => url)
					parent.addItemByRef(action.asReference(), targetIndex)
				},
			}
		},
	})
}

export function createDeleteCommand(payload: {
	selection: SelectionContext<ActionURL | HeadingURL>
}) {
	return createCommand({
		id: "delete",
		label: "Delete",
		shortcut: "backspace",
		exe() {
			const selected = payload.selection.selected()
			const index = payload.selection.lastSelectedIndex()
			const previous =
				payload.selection
					.all()
					.find((_, i) => i == index + 1 || i == index - 1) ??
				payload.selection.all()[0]

			for (const url of selected) {
				const item = useModelAfterDark(url) as Action | Project | Heading

				if (item) {
					if (item.type == "action") {
						item.delete()
					} else if (item.type == "heading") {
						item.toggleArchived(true)
					} else if (item.type == "project") {
						item.delete()
					}
				}
			}

			payload.selection.select(previous)

			return {
				undo() {
					for (const url of selected) {
						const item = useModelAfterDark(url) as Action | Project | Heading

						if (item) {
							if (item.type == "action") {
								item.undelete()
							} else if (item.type == "heading") {
								item.toggleArchived(false)
							} else if (item.type == "project") {
								item.undelete()
							}
						}
						payload.selection.select(selected)
					}
				},
				redo() {
					for (const url of selected) {
						const item = useModelAfterDark(url) as Action | Project | Heading
						if (item) {
							if (item.type == "action") {
								item.delete()
							} else if (item.type == "heading") {
								item.toggleArchived(true)
							} else if (item.type == "project") {
								item.delete()
							}
						}
					}
				},
			}
		},
	})
}

export function createCompleteCommand(payload: {
	selection: SelectionContext<ActionURL>
	stage(fn: () => void, url: ActionURL | ProjectURL | HeadingURL): void
}) {
	return createCommand({
		id: "complete",
		label: "Toggle Completed",
		shortcut: "cmd+k",
		exe() {
			const models = payload.selection
				.selected()
				.map(url => useModelAfterDark(url) as Project | Action | Heading)
				.filter(isDoable)
			// store the things that are doable

			const completed = models.filter(model => model.completed)
			const any = completed.length > 0
			const all = completed.length === models.length

			let force: boolean | undefined = undefined
			if (any && !all) {
				force = true
			} else if (all) {
				force = false
			} else {
				force = true
			}

			for (const model of models) {
				payload.stage(() => {
					model.toggleCompleted(force)
				}, model.url)
			}

			return {
				undo() {
					for (const model of models) {
						model.toggleCompleted(!force)
					}
				},
				redo() {
					for (const model of models) {
						payload.stage(() => {
							model.toggleCompleted(force)
						}, model.url)
					}
				},
			}
		},
	})
}

export function createCancelCommand(payload: {
	selection: SelectionContext<ActionURL>
	stage(fn: () => void, url: ActionURL | ProjectURL | HeadingURL): void
}) {
	return createCommand({
		id: "cancel",
		label: "Toggle Completed",
		shortcut: "cmd+alt+k",
		exe() {
			const models = payload.selection
				.selected()
				.map(url => useModelAfterDark(url) as Project | Action | Heading)
				.filter(isDoable)
			// store the things that are doable
			const urls = models.map(model => model.url)

			const canceled = models.filter(model => model.canceled)
			const any = canceled.length > 0
			const all = canceled.length === models.length

			let force: boolean | undefined = undefined
			if (any && !all) {
				force = true
			} else if (all) {
				force = false
			} else {
				force = true
			}

			for (const model of models) {
				payload.stage(() => {
					model.toggleCanceled(force)
				}, model.url)
			}

			payload.selection.select(urls)

			return {
				undo() {
					for (const model of models) {
						if (model) {
							model.toggleCanceled(!force)
						}
					}
				},
				redo() {
					for (const model of models) {
						if (model) {
							payload.stage(() => {
								model.toggleCanceled(force)
							}, model.url)
						}
					}
				},
			}
		},
	})
}
