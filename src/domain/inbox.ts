import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {ActionURL} from "./action.ts"

export type InboxURL = AutomergeUrl & {type: "inbox"}

export interface Inbox {
	type: "inbox"
	actions: ActionURL[]
	// inboxes have no parent? or multiple parents...?
}

export function newInbox(): Inbox {
	return {
		type: "inbox",
		actions: [],
	}
}
