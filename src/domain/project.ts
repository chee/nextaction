import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Doable} from "./doable.ts"
import type {ActionRef} from "@/domain/action.ts"
import type {HeadingRef} from "@/domain/heading.ts"
import type {Reference} from "@/domain/reference.ts"

export type ProjectURL = AutomergeUrl & {type: "project"}
export type ProjectRef = Reference<"project">

export type Project = Doable & {
	type: "project"
	title: string
	notes: string
	icon: string
	tags: AutomergeUrl[]
	items: (ActionRef | HeadingRef)[]
}

export function newProject(project?: Partial<Project>): Project {
	return {
		type: "project",
		title: "",
		notes: "",
		items: [],
		icon: "📁",
		tags: [],
		state: "open",
		...project,
	}
}

export function isProject(project: unknown): project is Project {
	return (project as Project).type === "project"
}

export function isProjectRef(ref: unknown): ref is ProjectRef {
	return (ref as ProjectRef).ref && (ref as ProjectRef).type === "project"
}
