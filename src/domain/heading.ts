import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "@/domain/reference.ts"
import type {ProjectRef} from "./project.ts"

export type HeadingURL = AutomergeUrl & {type: "heading"}
export type HeadingRef = Reference<"heading">

export type Heading = {
	type: "heading"
	title: string
	parent: ProjectRef
	archived?: boolean
}

export function newHeading(
	heading: Partial<Heading> & {parent: ProjectRef}
): Heading {
	return {
		type: "heading",
		title: "",
		...heading,
	}
}

export function isHeading(heading: unknown): heading is Heading {
	return (heading as Heading).type === "heading"
}

export function isHeadingRef(ref: unknown): ref is HeadingRef {
	return (ref as HeadingRef).ref && (ref as HeadingRef).type === "heading"
}

export function toggleArchived(heading: Heading, force?: boolean) {
	if (force == null) {
		force = !heading.archived
	}
	heading.archived = force
}
