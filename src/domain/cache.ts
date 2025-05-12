import type {AutomergeUrl} from "@automerge/automerge-repo/slim"

const cache = new Map<AutomergeUrl, unknown>()

export function has(url?: AutomergeUrl | undefined): boolean {
	if (!url) {
		return false
	}

	return cache.has(url)
}

export function get<T>(url?: AutomergeUrl | undefined): T | undefined {
	if (!url) {
		return undefined
	}
	const doc = cache.get(url)

	return doc as T
}

export function set<T>(url: AutomergeUrl | undefined, doc: T): void {
	if (!url) {
		return
	}

	cache.set(url, doc)
}
