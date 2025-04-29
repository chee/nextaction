import type {AutomergeUrl} from "@automerge/automerge-repo"

export type HeadingURL = AutomergeUrl & {type: "heading"}

export interface Heading {
	type: "heading"
	title: string
	actions: AutomergeUrl[]
}

export function newHeading(heading?: Partial<Heading>): Heading {
	return {
		type: "heading",
		title: "",
		actions: [] as AutomergeUrl[],
		...heading,
	}
}

export function isHeading(heading: unknown): heading is Heading {
	return (heading as Heading).type === "heading"
}
