import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "@/domain/reference.ts"
import type {ProjectRef} from "./project.ts"
import type {ActionRef} from "./action.ts"

export type AreaURL = AutomergeUrl & {type: "area"}
export type AreaRef = Reference<"area">

export type Area = {
	type: "area"
	title: string
	icon?: string
	notes: string
	items: (ProjectRef | ActionRef)[]
	deleted?: boolean
}

export function newArea(area?: Partial<Area>): Area {
	return {
		icon: "🗃️",
		type: "area",
		title: "",
		notes: "",
		items: [],
		...area,
	}
}

export function isArea(area: unknown): area is Area {
	return (area as Area).type === "area"
}

export function isAreaRef(ref: unknown): ref is AreaRef {
	return (ref as AreaRef).type === "area"
}
