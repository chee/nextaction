import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "::shapes/reference.ts"
import type {ActionRef} from "./action.ts"

export type HeadingURL = AutomergeUrl & {type: "heading"}
export type HeadingRef = Reference<"heading">

export type HeadingShape = {
	type: "heading"
	title: string
	archived?: boolean
	items: ActionRef[]
}

export function createHeadingShape(
	heading?: Partial<HeadingShape>
): HeadingShape {
	return {
		type: "heading",
		title: "",
		items: [],
		...heading,
	}
}

export function isHeading(heading: unknown): heading is HeadingShape {
	return (heading as HeadingShape).type === "heading"
}

export function isHeadingRef(ref: unknown): ref is HeadingRef {
	return (ref as HeadingRef).type === "heading"
}

export function toggleArchived(heading: HeadingShape, force?: boolean) {
	if (force == null) {
		force = !heading.archived
	}
	heading.archived = force
}
