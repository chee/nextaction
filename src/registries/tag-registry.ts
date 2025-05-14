import type {AnyDoableURL} from ":concepts:"
import {createStore} from "solid-js/store"

export type TagRegistry = {
	[K in AnyDoableURL]: string[]
}

const [tagRegistry, updateTagRegistry] = createStore<TagRegistry>({})

export function associateTags<T extends keyof TagRegistry>(
	url: T | undefined,
	tags: string[]
) {
	if (url) updateTagRegistry(url, tags)
}

export function associateTag<T extends keyof TagRegistry>(
	url: T | undefined,
	tag: string
) {
	if (!url) return
	const currentTags = tagRegistry[url] ?? []
	const tags = currentTags.includes(tag) ? currentTags : [...currentTags, tag]
	updateTagRegistry(url, tags)
}

export function getTags<K extends AnyDoableURL>(url: K): TagRegistry[K] {
	return tagRegistry[url]
}

export {tagRegistry, updateTagRegistry}
