import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./doable.ts"
import type {Reference} from "@/domain/reference.ts"

export type ActionURL = AutomergeUrl & {type: "action"}
export type ActionRef = Reference<"action">

export type Action = Doable & {
	type: "action"
	title: string
	notes: string
	checklist: string[]
	tags: AutomergeUrl[]
}

export function newAction(action?: Partial<Action>): Action {
	return {
		type: "action",
		title: "",
		notes: "",
		tags: [] as AutomergeUrl[],
		checklist: [] as string[],
		state: "open",
		...action,
	}
}

export function isAction(action: unknown): action is Action {
	return (action as Action).type === "action"
}

export function isActionRef(ref: unknown): ref is ActionRef {
	return (ref as ActionRef).ref && (ref as ActionRef).type === "action"
}

export function parseWhen(date: string | undefined | Date): string | undefined {
	if (date instanceof Date) {
		date = date.toISOString().split("T")[0]
	}
	if (date === "today") {
		date = new Date().toISOString().split("T")[0]
	}
	if (date && date != "someday" && !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
		throw new Error(`Invalid date format: ${date}`)
	}
	return date
}
