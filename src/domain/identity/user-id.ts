import {createSignal} from "solid-js"
import {makePersisted} from "@solid-primitives/storage"
import type {UserURL} from "::core/shapes/user.ts"

useUserId.key = "nextaction:user-id"

export function useUserId() {
	const oldId = localStorage.getItem("taskplace:user-id")
	if (oldId) {
		delete globalThis.localStorage["taskplace:user-id"]
		localStorage.setItem("nextaction:user-id", oldId)
	}

	const [userId, setUserId] = makePersisted(
		// eslint-disable-next-line solid/reactivity
		createSignal<UserURL | undefined>(undefined),
		{
			name: useUserId.key,
		}
	)

	return [
		userId,
		setUserId,
		() => {
			setUserId(undefined)
			delete globalThis.localStorage[useUserId.key]
		},
	] as const
}
