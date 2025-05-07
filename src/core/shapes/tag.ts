import type {AutomergeUrl} from "@automerge/automerge-repo"

export type TagURL = AutomergeUrl & {type: "tag"}
export type Tag = {
	type: "tag"
	title: string
	items: {
		[key: AutomergeUrl]: boolean
	}
}

export function createTagShape(tag?: Partial<Tag>): Tag {
	return {
		type: "tag",
		title: "",
		items: {},
		...tag,
	}
}

export function isTag(tag: unknown): tag is Tag {
	return (tag as Tag).type === "tag"
}

export function tagItem(tag: Tag, itemURL: AutomergeUrl) {
	if (!tag.items) {
		tag.items = {}
	}
	tag.items[itemURL] = true
}

export function untagItem(tag: Tag, itemURL: AutomergeUrl) {
	if (!tag.items) {
		return
	}
	delete tag.items[itemURL]
}
