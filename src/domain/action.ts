import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./doable.ts"

export type ActionURL = AutomergeUrl & {type: "action"}

export interface Action extends Doable {
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
		...action,
	}
}

export function isAction(action: unknown): action is Action {
	return (action as Action).type === "action"
}
