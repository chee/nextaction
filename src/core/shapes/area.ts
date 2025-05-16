import type {AutomergeUrl} from "@automerge/vanillajs"
import type {Reference} from "::shapes/reference.ts"
import type {ProjectRef} from "./project.ts"
import type {ActionRef} from "./action.ts"
import {curl} from "../sync/automerge.ts"

export type AreaURL = AutomergeUrl & {type: "area"}
export type AreaRef = Reference<"area">

export type AreaShape = {
	type: "area"
	title: string
	icon?: string
	notes: string
	items: (ProjectRef | ActionRef)[]
	deleted?: boolean
}

export function createAreaShape(area?: Partial<AreaShape>): AreaShape {
	return {
		icon: "🗃️",
		type: "area",
		title: "",
		notes: "",
		items: [],
		...area,
	}
}

export function createArea(
	area?: Parameters<typeof createAreaShape>[0]
): AreaURL {
	return curl<AreaURL>(createAreaShape(area))
}

export function createAreaRef(
	area?: Parameters<typeof createAreaShape>[0]
): AreaRef {
	return {
		type: "area",
		url: curl<AreaURL>(createAreaShape(area)),
	}
}

export function isAreaShape(area: unknown): area is AreaShape {
	return (area as AreaShape).type === "area"
}

export function isAreaRef(ref: unknown): ref is AreaRef {
	return (ref as AreaRef).type === "area"
}
