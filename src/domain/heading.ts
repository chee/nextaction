import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {Reference} from "@/domain/reference.ts"
import type {ActionRef} from "@/domain/action.ts"

export type HeadingURL = AutomergeUrl & {type: "heading"}
export type HeadingRef = Reference<"heading">

export type Heading = {
	type: "heading"
	title: string
	items: ActionRef[]
}

export function newHeading(heading?: Partial<Heading>): Heading {
	return {
		type: "heading",
		title: "",
		items: [],
		...heading,
	}
}

export function isHeading(heading: unknown): heading is Heading {
	return (heading as Heading).type === "heading"
}

export function isHeadingRef(ref: unknown): ref is HeadingRef {
	return (ref as HeadingRef).ref && (ref as HeadingRef).type === "heading"
}
