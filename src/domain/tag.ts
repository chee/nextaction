import type {AutomergeUrl} from "@automerge/automerge-repo"

export type TagURL = AutomergeUrl & {type: "tag"}
export type Tag = {
	type: "tag"
	title: string
}

export function newTag(tag?: Partial<Tag>): Tag {
	return {
		type: "tag",
		title: "",
		...tag,
	}
}

export function isTag(tag: unknown): tag is Tag {
	return (tag as Tag).type === "tag"
}
