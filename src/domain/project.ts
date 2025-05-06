import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./generic/doable.ts"
import type {Reference} from "@/domain/reference.ts"
import type {HeadingRef} from "./heading.ts"
import type {ActionRef} from "./action.ts"

export type ProjectURL = AutomergeUrl & {type: "project"}
export type ProjectRef = Reference<"project">

export type Project = Doable & {
	type: "project"
	title: string
	notes: string
	icon: string
	items: (HeadingRef | ActionRef)[]
}

export function newProject(project?: Partial<Project>): Project {
	return {
		icon: "📁",
		type: "project",
		title: "",
		notes: "",
		state: "open",
		items: [],
		...project,
	}
}

export function isProject(project: unknown): project is Project {
	return (project as Project).type === "project"
}

export function isProjectRef(ref: unknown): ref is ProjectRef {
	return (ref as ProjectRef).type === "project"
}
