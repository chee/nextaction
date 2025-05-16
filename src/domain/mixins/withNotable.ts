import type {DocHandle} from "@automerge/vanillajs"
import {useCodemirrorAutomerge} from "::domain/editor/useCodemirrorAutomerge.ts"
import type {Extension} from "@codemirror/state"

export function withNotable(
	doc: () => {notes: string} | undefined,
	handle: () => DocHandle<{notes: string}> | undefined
) {
	const notesSyncExtension = useCodemirrorAutomerge(handle, ["notes"])
	return {
		get notesSyncExtension() {
			return notesSyncExtension()
		},
		get notes() {
			return doc()?.notes ?? ""
		},
	}
}

export interface NotableMixin {
	readonly notesSyncExtension?: Extension
	readonly notes: string
}
