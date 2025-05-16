import type {Accessor} from "solid-js"
import type {DocHandle} from "@automerge/vanillajs"
import {createMemo} from "solid-js"
import {automergeSyncPlugin} from "@automerge/automerge-codemirror"

export function useCodemirrorAutomerge(
	handle: Accessor<DocHandle<unknown> | undefined>,
	path: string[]
) {
	const extension = createMemo(
		() => handle() && automergeSyncPlugin({handle: handle()!, path})
	)
	return extension
}
