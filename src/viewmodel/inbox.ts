import {useActionList} from "./generic/action-list.ts"
import extend from "merge-descriptors"
import type {InboxURL} from "@/domain/inbox.ts"

export function useInbox(url: () => InboxURL | undefined) {
	const inbox = useActionList(url)
	return extend(inbox, {
		get url() {
			return url()
		},
	})
}

export type InboxViewModel = ReturnType<typeof useInbox>
