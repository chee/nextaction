import type {DocHandle} from "@automerge/automerge-repo"
import {useCodemirrorAutomerge} from "../../infra/editor/codemirror.ts"

export function useNotableMixin(
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
