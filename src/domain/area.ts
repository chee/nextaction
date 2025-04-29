import type {AutomergeUrl} from "@automerge/automerge-repo"

export type AreaURL = AutomergeUrl & {type: "area"}

export interface Area {
	type: "area"
	title: string
	icon?: string
	notes: string
	projects: AutomergeUrl[]
	actions: AutomergeUrl[]
}

export function newArea(area?: Partial<Area>): Area {
	return {
		type: "area",
		title: "",
		notes: "",
		projects: [] as AutomergeUrl[],
		actions: [] as AutomergeUrl[],
		...area,
	}
}
