import type {AutomergeUrl} from "@automerge/automerge-repo"
import {parseIncomingWhen, type Doable} from "./generic/doable.ts"
import {type Reference} from "::domain/reference.ts"

export type ActionURL = AutomergeUrl & {type: "action"}
export type ActionRef = Reference<"action">

export type Action = Doable & {
	type: "action"
	title: string
	notes: string
	checklist: string[]
}

export function newAction(
	action?: Partial<Action> & {when?: Parameters<typeof parseIncomingWhen>[0]}
): Action {
	if (action?.when) {
		action.when = parseIncomingWhen(action.when)
		if (!action.when) {
			delete action.when
		}
	}
	return {
		type: "action",
		title: "",
		notes: "",
		checklist: [] as string[],
		state: "open",
		...action,
	}
}

export function isAction(action: unknown): action is Action {
	return (action as Action).type === "action"
}

export function isActionRef(ref: unknown): ref is ActionRef {
	return (ref as ActionRef).type === "action"
}
