import type {DocHandle} from "@automerge/automerge-repo"
import {useCodemirrorAutomerge} from "../../infra/editor/codemirror.ts"

export function useTitleableMixin(
	doc: () => {title: string} | undefined,
	handle: () => DocHandle<{title: string}> | undefined
) {
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])
	return {
		get titleSyncExtension() {
			return titleSyncExtension()
		},
		get title() {
			return doc()?.title ?? ""
		},
	}
}
