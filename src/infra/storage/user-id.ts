import {createSignal} from "solid-js"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {makePersisted} from "@solid-primitives/storage"

export function useUserId() {
	const [userId, setUserId] = makePersisted(
		// eslint-disable-next-line solid/reactivity
		createSignal<AutomergeUrl | undefined>(undefined),
		{
			name: "taskplace:user-id",
		}
	)
	return [userId, setUserId] as const
}
