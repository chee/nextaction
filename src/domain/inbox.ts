import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {ActionRef} from "./action.ts"

export type InboxURL = AutomergeUrl & {type: "inbox"}

export type Inbox = {
	type: "inbox"
	items: ActionRef[]
}

export function newInbox(): Inbox {
	return {
		type: "inbox",
		items: [],
	}
}
