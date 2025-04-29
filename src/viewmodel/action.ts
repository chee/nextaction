import type {Accessor} from "solid-js"
import {Action, type ActionURL} from "@/domain/action.ts"
import {useDocument} from "solid-automerge"
import {isComplete} from "@/domain/doable.ts"
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
		get done() {
			return action()?.done
		},
		get complete() {
			return action() && isComplete(action()!)
		},
		toggle() {
			handle()?.change(action => {
				if (isComplete(action)) {
					delete action.done
				} else {
					action.done = new Date()
				}
			})
		},
		get external(): {[Key in NativeMediaType]?: string} {
			return {
				"text/plain": `- [${this.complete ? "x" : " "}] ${this.title}`,
				"text/html": `<input type='checkbox' ${
					this.complete ? "checked" : ""
				} value="${this.title}" />`,
			}
		},
	}
}

export type ActionViewModel = ReturnType<typeof useAction>

export function isActionViewModel(action: unknown): action is ActionViewModel {
	return (action as ActionViewModel).type === "action"
}
