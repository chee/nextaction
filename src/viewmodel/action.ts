import type {Accessor} from "solid-js"
import {Action, type ActionURL} from "@/domain/action.ts"
import {useDocument} from "solid-automerge"
import {useCodemirrorAutomerge} from "@/infra/editor/codemirror.ts"
import {useDoable, type DoableViewModel} from "./generic/doable.ts"
import mergeDescriptors from "merge-descriptors"
import type {Extension} from "@codemirror/state"
import type {HeadingURL} from "../domain/heading.ts"
import type {AreaURL} from "../domain/area.ts"

export function useAction(url: Accessor<ActionURL>) {
	const [action, handle] = useDocument<Action>(url)
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])
	const notesSyncExtension = useCodemirrorAutomerge(handle, ["notes"])
	const doable = useDoable(url)

	return mergeDescriptors(doable, {
		type: "action" as const,
		get url() {
			return handle()?.url as ActionURL
		},
		get title() {
			return action()?.title ?? ""
		},
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
		get deleted() {
			return action()?.deleted ?? false
		},
		get checklist() {
			return action()?.checklist ?? []
		},
		get parentURL() {
			return action()?.parent?.url
		},
		orphan() {
			// todo move to Parentable
			handle()?.change(action => delete action.parent)
		},
		setParent(
			type: "project" | "area" | "heading",
			url: ActionURL | HeadingURL | AreaURL
		) {
			handle()?.change(action => {
				action.parent = {type, url, ref: true}
			})
		},
		// todo use in dnd contract
		// get external(): {[Key in NativeMediaType]?: string} {
		// 	const done = action() && isDone(action()!)
		// 	return {
		// 		"text/plain": `- [${done ? "x" : " "}] ${this.title}`,
		// 		"text/html": `<input type='checkbox' ${done ? "checked" : ""} value="${
		// 			this.title
		// 		}" />`,
		// 	}
		// },
	})
}

export type ActionViewModel = ReturnType<typeof useAction>

export function isActionViewModel(action: unknown): action is ActionViewModel {
	return (action as ActionViewModel).type === "action"
}
