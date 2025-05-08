import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {ActionRef} from "./action.ts"
import {curl} from "../sync/automerge.ts"

export type InboxURL = AutomergeUrl & {type: "inbox"}

export type InboxShape = {
	type: "inbox"
	items: ActionRef[]
}

export function createInboxShape(): InboxShape {
	return {
		type: "inbox",
		items: [],
	}
}

export function createInbox(): InboxURL {
	return curl<InboxURL>(createInboxShape())
}
