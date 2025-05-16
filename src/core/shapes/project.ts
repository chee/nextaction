import type {AutomergeUrl} from "@automerge/vanillajs"
import type {DoableShape} from "./mixins/doable.ts"
import type {Reference} from "./reference.ts"
import type {HeadingRef} from "./heading.ts"
import type {ActionRef} from "./action.ts"
import {curl} from "../sync/automerge.ts"

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
export function createProject(
	project: Parameters<typeof createProjectShape>[0]
): ProjectURL {
	return curl<ProjectURL>(createProjectShape(project))
}

export function createProjectRef(
	project: Parameters<typeof createProjectShape>[0]
): ProjectRef {
	return {
		type: "project",
		url: createProject(project),
	}
}

export function isProjectShape(project: unknown): project is ProjectShape {
	return (project as ProjectShape).type === "project"
}

export function isProjectRef(ref: unknown): ref is ProjectRef {
	return (ref as ProjectRef).type === "project"
}
