import type {DocHandle} from "@automerge/automerge-repo"
import {useCodemirrorAutomerge} from "::domain/editor/useCodemirrorAutomerge.ts"
import type {Extension} from "@codemirror/state"

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

export interface TitleableMixin {
	readonly titleSyncExtension?: Extension
	readonly title: string
}
