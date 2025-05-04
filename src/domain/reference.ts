import type {ActionRef} from "@/domain/action.ts"
import type {ProjectRef} from "@/domain/project.ts"
import type {AreaRef} from "@/domain/area.ts"
import type {HeadingRef} from "./heading.ts"

// todo make url based on type, we know what things can be referenced
export type Reference<Type extends string = string> = {
	type: Type
	url: string
}

export type ReferencePointer<Type extends string = string> = {
	type: Type
	url: string
	above?: boolean
}

export type AnyRef = ActionRef | ProjectRef | AreaRef | HeadingRef
export type RefMap = {
	action: ActionRef
	project: ProjectRef
	area: AreaRef
	heading: HeadingRef
}

export type AnyList = {items: AnyRef[]}

export function includesReference<T extends Reference>(list: T[], ref: T) {
	return list.some(
		item => item == ref || (item.url === ref.url && item.type === ref.type)
	)
}

export function indexOfReference<T extends Reference>(list: T[], ref: T) {
	return list.findIndex(
		item => item == ref || (item.url === ref.url && item.type === ref.type)
	)
}

export function includesURL<T extends Reference>(list: T[], url: T["url"]) {
	return list.some(item => item.url === url)
}

export function indexOfURL<T extends Reference>(list: T[], url: T["url"]) {
	return list.findIndex(item => item.url === url)
}

export function refer<T extends AnyRef["url"], U extends AnyRef["url"]>(
	type: T,
	url: U
) {
	return {type, url, ref: true} as const
}

function array<T>(item: T | T[]) {
	if (Array.isArray(item)) return item
	return [item]
}

export function addReference(
	list: Reference[],
	type: string,
	urls: string | string[],
	index?: number | ReferencePointer
) {
	urls = array(urls)
	for (const url of urls) {
		const ref = refer(type, url)
		addReferenceByRef(list, ref, index)
	}
}

export function addReferenceByRef(
	list: Reference[],
	refs: Reference | Reference[],
	index?: number | ReferencePointer
) {
	refs = array(refs)
	for (const ref of refs) {
		if (includesReference(list, ref)) continue
		if (typeof index == "number") {
			if (index >= 0 && index < list.length + 1) {
				list.splice(index, 0, ref)
			} else if (index < 0) {
				list.unshift(ref)
			}
		} else if (typeof index == "object") {
			const refpoint = index
			const i = indexOfReference(list, refer(refpoint.type, refpoint.url))
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

export function removeReference(
	list: Reference[],
	type: string,
	urls: string | string[]
) {
	urls = array(urls)
	for (const url of urls) {
		const ref = refer(type, url)
		removeReferenceByRef(list, ref)
	}
}

export function removeReferenceByRef(
	list: Reference[],
	refs: Reference | Reference[]
) {
	refs = array(refs)
	for (const ref of refs) {
		if (!includesReference(list, ref)) continue
		const i = indexOfReference(list, ref)
		if (i != -1) {
			list.splice(i, 1)
		}
	}
}

export function moveReference(
	list: Reference[],
	type: string,
	urls: string | string[],
	targetIndex: number
) {
	urls = array(urls)
	const toInsert = urls
		.map(url => refer(type, url))
		.filter(ref => includesReference(list, ref))
		.sort(
			(left, right) =>
				indexOfReference(list, left) - indexOfReference(list, right)
		)

	if (!toInsert.length) return

	toInsert
		.map(ref => indexOfReference(list, ref))
		.sort((a, b) => b - a)
		.forEach(i => list.splice(i, 1))

	const insertAt = Math.max(0, Math.min(targetIndex, list.length))
	list.splice(insertAt, 0, ...toInsert)
}

export function moveReferenceAfter(
	list: Reference[],
	type: string,
	urls: string | string[],
	target: string | Reference,
	offset = 1
) {
	urls = array(urls)
	const newItems = urls
		.map(url => refer(type, url))
		.filter(ref => includesReference(list, ref))
		.sort(
			(left, right) =>
				indexOfReference(list, left) - indexOfReference(list, right)
		)

	if (!newItems.length) return

	newItems.forEach(item => {
		const itemIndex = indexOfReference(list, item)
		if (itemIndex !== -1) {
			list.splice(itemIndex, 1)
		}
	})

	const targetRef = typeof target === "string" ? refer(type, target) : target
	const index = indexOfReference(list, targetRef) + offset

	if (index > list.length) {
		list.push(...newItems)
		return
	}

	if (index < 0) {
		list.unshift(...newItems)
		return
	}

	list.splice(index, 0, ...newItems)
}

export function moveReferenceBefore(
	list: Reference[],
	type: string,
	urls: string | string[],
	target: string | Reference
) {
	moveReferenceAfter(list, type, urls, target, 0)
}
