import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {DoableShape} from "./mixins/doable.ts"
import type {Reference} from "./reference.ts"
import type {HeadingRef} from "./heading.ts"
import type {ActionRef} from "./action.ts"

export type ProjectURL = AutomergeUrl & {type: "project"}
export type ProjectRef = Reference<"project">

export type ProjectShape = DoableShape & {
	type: "project"
	title: string
	notes: string
	icon: string
	items: (HeadingRef | ActionRef)[]
}

export function createProjectShape(
	project?: Partial<ProjectShape>
): ProjectShape {
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

export function isProjectShape(project: unknown): project is ProjectShape {
	return (project as ProjectShape).type === "project"
}

export function isProjectRef(ref: unknown): ref is ProjectRef {
	return (ref as ProjectRef).type === "project"
}
