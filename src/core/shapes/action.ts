import type {AutomergeUrl} from "@automerge/automerge-repo"
import {parseIncomingWhen, type DoableShape} from "::shapes/mixins/doable.ts"
import {type Reference} from "::shapes/reference.ts"
import {curl} from "../sync/automerge.ts"

export type ActionURL = AutomergeUrl & {type: "action"}
export type ActionRef = Reference<"action">

export type ActionShape = DoableShape & {
	type: "action"
	title: string
	notes: string
	checklist: string[]
}

export function createActionShape(
	action?: Partial<ActionShape> & {
		when?: Parameters<typeof parseIncomingWhen>[0]
	}
): ActionShape {
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

export function createAction(
	action?: Parameters<typeof createActionShape>[0]
): ActionURL {
	return curl<ActionURL>(createActionShape(action)) as ActionURL
}

export function createActionRef(
	action?: Parameters<typeof createActionShape>[0]
): ActionRef {
	return {
		type: "action",
		url: curl<ActionURL>(createActionShape(action)),
	}
}

export function isActionShape(action: unknown): action is ActionShape {
	return (action as ActionShape).type === "action"
}

export function isActionRef(ref: unknown): ref is ActionRef {
	return (ref as ActionRef).type === "action"
}
