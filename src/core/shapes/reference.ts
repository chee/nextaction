import type {AnyRef, ConceptName, ConceptURLMap} from ":concepts:"
import {getType} from "::registries/type-registry.ts"

export type Reference<T extends ConceptName> = {
	type: T
	url: ConceptURLMap[T]
}

export type ReferencePointer<T extends ConceptName> = {
	type: T
	url: Reference<T>["url"]
	above?: boolean
}

export function includesReference<T extends AnyRef>(list: T[], ref: T) {
	return list.some(
		item => item == ref || (item.url === ref.url && item.type === ref.type)
	)
}

export function indexOfReference<T extends AnyRef>(list: T[], ref: T) {
	return list.findIndex(
		item => item == ref || (item.url === ref.url && item.type === ref.type)
	)
}

export function includesURL<T extends AnyRef>(list: T[], url: T["url"]) {
	return list.some(item => item.url === url)
}

export function indexOfURL<T extends AnyRef>(list: T[], url: T["url"]) {
	return list.findIndex(item => item.url === url)
}

export function refer<T extends ConceptName>(
	type: T,
	url: ConceptURLMap[T]
): Reference<T> {
	return {type, url} as const
}

export function referAfterDark<T extends ConceptName>(
	url: ConceptURLMap[T]
): Reference<T> {
	return {type: getType(url) as unknown as T, url} as const
}

export function point<T extends ConceptName>(
	type: T,
	url: ConceptURLMap[T],
	above?: boolean
): ReferencePointer<T> {
	return {type, url, above} as const
}

function array<T>(item: T | T[]): T[] {
	if (Array.isArray(item)) return item
	return [item]
}

export function addReference<T extends AnyRef>(
	list: T[],
	type: T["type"],
	urls: T["url"] | T["url"][],
	index?: number | ReferencePointer<T["type"]>
) {
	for (const url of array(urls)) {
		const ref = refer(type, url as ConceptURLMap[T["type"]])
		addReferenceByRef(list, ref as T, index)
	}
}

export function addReferenceByRef<T extends AnyRef>(
	list: T[],
	refs: T | T[],
	index?: number | ReferencePointer<T["type"]>
) {
	for (const ref of array(refs)) {
		if (includesReference(list, ref)) continue
		if (typeof index == "number") {
			if (index >= 0 && index < list.length + 1) {
				list.splice(index, 0, ref)
			} else if (index < 0) {
				list.unshift(ref)
			}
		} else if (typeof index == "object") {
			const refpoint = index
			const i = indexOfReference(list, refer(refpoint.type, refpoint.url) as T)
			if (i != -1) {
				list.splice(i + (index.above ? 0 : 1), 0, ref)
			} else {
				list.unshift(ref)
			}
		} else {
			list.push(ref)
		}
	}
}

export function removeReference<T extends AnyRef>(
	list: T[],
	type: T["type"],
	urls: T["url"] | T["url"][]
) {
	for (const url of array(urls)) {
		const ref = refer(type, url as ConceptURLMap[T["type"]])
		removeReferenceByRef(list, ref as T)
	}
}

export function removeReferenceByRef<T extends AnyRef>(
	list: T[],
	refs: T | T[]
) {
	for (const ref of array(refs)) {
		if (!includesReference(list, ref)) continue
		const i = indexOfReference(list, ref)
		if (i != -1) {
			list.splice(i, 1)
		}
	}
}

export function moveReference<T extends AnyRef>(
	list: T[],
	type: T["type"],
	urls: T["url"] | T["url"][],
	targetIndex: number
) {
	const toInsert = array(urls)
		.map(url => refer(type, url as ConceptURLMap[T["type"]]))
		.filter(ref => includesReference(list, ref as T))
		.sort(
			(left, right) =>
				indexOfReference(list, left as T) - indexOfReference(list, right as T)
		)

	if (!toInsert.length) return

	toInsert
		.map(ref => indexOfReference(list, ref as T))
		.sort((a, b) => b - a)
		.forEach(i => list.splice(i, 1))

	const insertAt = Math.max(0, Math.min(targetIndex, list.length))
	list.splice(insertAt, 0, ...(toInsert as T[]))
}

export function moveReferenceAfter<T extends AnyRef>(
	list: T[],
	type: T["type"],
	urls: T["url"] | T["url"][],
	target: string | T,
	offset = 1
) {
	const newItems = array(urls)
		.map(url => refer(type, url as ConceptURLMap[T["type"]]))
		.filter(ref => includesReference(list, ref as T))
		.sort(
			(left, right) =>
				indexOfReference(list, left as T) - indexOfReference(list, right as T)
		)

	if (!newItems.length) return

	newItems.forEach(item => {
		const itemIndex = indexOfReference(list, item as T)
		if (itemIndex !== -1) {
			list.splice(itemIndex, 1)
		}
	})

	const targetRef =
		typeof target === "string"
			? refer(type, target as ConceptURLMap[T["type"]])
			: target
	const index = indexOfReference(list, targetRef as T) + offset

	if (index > list.length) {
		list.push(...(newItems as T[]))
		return
	}

	if (index < 0) {
		list.unshift(...(newItems as T[]))
		return
	}

	list.splice(index, 0, ...(newItems as T[]))
}

export function moveReferenceBefore<T extends AnyRef>(
	list: T[],
	type: T["type"],
	urls: T["url"] | T["url"][],
	target: string | T
) {
	moveReferenceAfter(list, type, urls, target, 0)
}
