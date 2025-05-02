import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "@/domain/reference.ts"

export type AreaURL = AutomergeUrl & {type: "area"}
export type AreaRef = Reference<"area">

export type Area = {
	type: "area"
	title: string
	icon?: string
	notes: string
}

export function newArea(area?: Partial<Area>): Area {
	return {
		icon: "🗃️",
		type: "area",
		title: "",
		notes: "",
		...area,
	}
}

export function isArea(area: unknown): area is Area {
	return (area as Area).type === "area"
}

export function isAreaRef(ref: unknown): ref is AreaRef {
	return (ref as AreaRef).ref && (ref as AreaRef).type === "area"
}
