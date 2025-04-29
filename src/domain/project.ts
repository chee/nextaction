import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./doable.ts"

export type ProjectURL = AutomergeUrl & {type: "project"}

export interface Project extends Doable {
	type: "project"
	title: string
	notes: string
	icon: string
	tags: AutomergeUrl[]
	// these are actions OR headings
	items: AutomergeUrl[]
}

export function newProject(project?: Partial<Project>): Project {
	return {
		type: "project",
		title: "",
		notes: "",
		items: [] as AutomergeUrl[],
		icon: "📁",
		tags: [] as AutomergeUrl[],
		...project,
	}
}
