import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./generic/doable.ts"
import type {Reference} from "@/domain/reference.ts"
import type {ProjectRef} from "./project.ts"
import type {AreaRef} from "./area.ts"
import type {HeadingRef} from "./heading.ts"

export type ActionURL = AutomergeUrl & {type: "action"}
export type ActionRef = Reference<"action">

export type Action = Doable & {
	type: "action"
	title: string
	notes: string
	checklist: string[]
	parent?: ProjectRef | AreaRef | HeadingRef
}

export function newAction(action?: Partial<Action>): Action {
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
	return (ref as ActionRef).ref && (ref as ActionRef).type === "action"
}
