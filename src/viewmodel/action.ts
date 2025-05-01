import type {Accessor} from "solid-js"
import {Action, parseWhen, type ActionURL} from "@/domain/action.ts"
import {useDocument} from "solid-automerge"
import {isDone, toggleCanceled, toggleCompleted} from "@/domain/doable.ts"
import {useCodemirrorAutomerge} from "@/infra/editor/codemirror.ts"
import type {NativeMediaType} from "@atlaskit/pragmatic-drag-and-drop/external/adapter"

export function useAction(url: Accessor<ActionURL>) {
	const [action, handle] = useDocument<Action>(url)
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])
	const notesSyncExtension = useCodemirrorAutomerge(handle, ["notes"])

	return {
		type: "action",
		get url() {
			return handle()?.url as ActionURL
		},
		get title() {
			return action()?.title ?? ""
		},
		set title(title: string) {
			handle()?.change(action => {
				action.title = title
			})
		},
		// todo checklist
		// todo tags

		// todo move to a useNoteable
		get notes() {
			return action()?.notes ?? ""
		},
		get notesSyncExtension() {
			return notesSyncExtension()
		},
		get titleSyncExtension() {
			return titleSyncExtension()
		},
		// todo move to useDoable
		get state() {
			return action()?.state ?? "open"
		},
		toggleCompleted(force?: boolean) {
			handle()?.change(action => toggleCompleted(action, force))
		},
		toggleCanceled(force?: boolean) {
			handle()?.change(action => toggleCanceled(action, force))
		},
		// todo move to dnd contract
		get external(): {[Key in NativeMediaType]?: string} {
			const done = action() && isDone(action()!)
			return {
				"text/plain": `- [${done ? "x" : " "}] ${this.title}`,
				"text/html": `<input type='checkbox' ${done ? "checked" : ""} value="${
					this.title
				}" />`,
			}
		},
		get when(): string | undefined {
			return action()?.when
		},
		set when(date: string | undefined) {
			date = parseWhen(date)
			handle()?.change(action => {
				if (date) action.when = date
				else delete action.when
			})
		},
	}
}

export type ActionViewModel = ReturnType<typeof useAction>

export function isActionViewModel(action: unknown): action is ActionViewModel {
	return (action as ActionViewModel).type === "action"
}
