import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "::shapes/reference.ts"
import type {ActionRef} from "./action.ts"
import {curl} from "../sync/automerge.ts"

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

export function createHeading(
	heading: Parameters<typeof createHeadingShape>[0]
): HeadingURL {
	return curl<HeadingURL>(createHeadingShape(heading))
}
export function createHeadingRef(
	heading: Parameters<typeof createHeadingShape>[0]
): HeadingRef {
	return {
		type: "heading",
		url: curl<HeadingURL>(createHeadingShape(heading)),
	}
}

export function isHeadingShape(heading: unknown): heading is HeadingShape {
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
