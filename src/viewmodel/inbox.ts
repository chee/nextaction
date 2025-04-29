import { useHome } from "./home.ts"
import { useActionList } from "./action-list.ts"
import extend from "merge-descriptors"

export function useInbox() {
	const home = useHome()
	const inbox = useActionList(() => home.inboxURL)
	return extend(inbox, {
		get url() {
			return home.inboxURL
		},
	})
}

export type InboxViewModel = ReturnType<typeof useInbox>
