import {useDocument} from "solid-automerge"
import {type Accessor, mapArray} from "solid-js"
import {
	addReference,
	removeReference,
	moveReference,
	moveReferenceAfter,
	moveReferenceBefore,
	removeReferenceByRef,
	type ReferencePointer,
	addReferenceByRef,
} from "::shapes/reference.ts"
import {useModel} from "../useModel.ts"
import {createEffect} from "solid-js"
import flattenTree from "::core/util/flattenTree.ts"
import {createMemo} from "solid-js"
import type {
	ConceptURLMap,
	AnyParentType,
	ConceptName,
	ChildTypesFor,
	ChildRefsFor,
	ChildEntitiesFor,
	ConceptModelMap,
} from ":concepts:"
import defaultRepo from "::core/sync/automerge.ts"
import {registerType, type ConceptRegistry} from "::registries/type-registry.ts"
import {registerParent} from "::registries/parent-registry.ts"

export function useListMixin<
	T extends AnyParentType,
	U extends ConceptURLMap[T]
>(url: Accessor<U | undefined>, type: T, repo = defaultRepo): List<T, U> {
	type Item = ChildEntitiesFor<T>
	type R = ChildRefsFor<T>

	const [list, handle] = useDocument<{items: R[]}>(url, {repo})

	createEffect(() => {
		const u = url()
		if (u) {
			registerType(u as keyof ConceptRegistry, type)
		}
	})

	createEffect(() => {
		if (list()?.items) {
			for (const item of list()!.items) {
				registerType(item.url, item.type)
				registerParent(item.url, url())
			}
		}
	})

	const itemURLs = mapArray(
		() => list()?.items,
		ref => {
			registerType(ref.url, ref.type)
			registerParent(ref.url, url())
			return ref.url
		}
	)

	const items = mapArray(
		() => list()?.items,
		ref => useModel(ref)
	) as Accessor<Item[]>

	// todo ? https://primitives.solidjs.community/package/keyed/
	type KeyedEntities = {
		[K in ConceptName as ConceptURLMap[K]]: ConceptModelMap[K]
	}
	const flat = createMemo(() => flattenTree(items()))
	const keyed = createMemo(() => {
		return flat().reduce((acc, item) => {
			acc[item.url] = item
			return acc
		}, {} as KeyedEntities)
	}) as Accessor<KeyedEntities>

	return {
		get url() {
			return url()
		},
		get items() {
			return items()
		},
		get itemURLs() {
			return itemURLs()
		},
		get flat() {
			return flat()
		},
		get keyed() {
			return keyed()
		},
		addItem<I extends ChildTypesFor<T>>(
			type: I,
			urls: ConceptURLMap[I] | ConceptURLMap[I][],
			index?: number | ReferencePointer<ChildTypesFor<T>>
		) {
			handle()?.change(doc => addReference(doc.items, type, urls, index))
		},
		addItemByRef(ref: R | R[], index?: number | ReferencePointer<R["type"]>) {
			handle()?.change(doc => addReferenceByRef(doc.items, ref, index))
		},
		removeItem<I extends ChildTypesFor<T>>(
			type: I,
			urls: ConceptURLMap[I] | ConceptURLMap[I][]
		) {
			handle()?.change(doc => removeReference(doc.items, type, urls))
		},
		removeItemByRef(ref: R | R[]) {
			handle()?.change(doc => {
				removeReferenceByRef(doc.items, ref)
			})
		},
		hasItem(type: R["type"], url: R["url"]) {
			return Boolean(
				list()?.items.some(item => item.type == type && item.url == url)
			)
		},
		hasItemByRef(ref: R) {
			return Boolean(
				list()?.items.some(item => item.type == ref.type && item.url == ref.url)
			)
		},
		moveItem(type: R["type"], urls: R["url"] | R["url"][], index: number) {
			handle()?.change(doc => moveReference(doc.items, type, urls, index))
		},
		moveItemAfter(
			type: R["type"],
			urls: R["url"] | R["url"][],
			target: R["url"]
		) {
			handle()?.change(doc => moveReferenceAfter(doc.items, type, urls, target))
		},
		moveItemBefore(
			type: R["type"],
			urls: R["url"] | R["url"][],
			target: R["url"]
		) {
			handle()?.change(doc =>
				moveReferenceBefore(doc.items, type, urls, target)
			)
		},
		insertItemBefore(type: R["type"], url: R["url"], target: R["url"]) {
			handle()?.change(doc => {
				const index = doc.items.findIndex(item => item.url == target)
				addReference(
					doc.items,
					type,
					url,
					index == -1 ? doc.items.length - 1 : index
				)
			})
		},
	}
}

export interface List<
	T extends AnyParentType,
	U extends ConceptURLMap[T] = ConceptURLMap[T]
> {
	readonly url: U | undefined
	readonly items: ChildEntitiesFor<T>[]
	readonly itemURLs: ChildRefsFor<T>["url"][]
	readonly flat: ChildEntitiesFor<T>[]
	readonly keyed: {
		[K in ConceptName as ConceptURLMap[K]]: ConceptModelMap[K]
	}
	readonly addItem: <I extends ChildTypesFor<T>>(
		type: I,
		urls: ConceptURLMap[I] | ConceptURLMap[I][],
		index?: number | ReferencePointer<ChildTypesFor<T>>
	) => void
	readonly addItemByRef: (
		ref: ChildRefsFor<T> | ChildRefsFor<T>[],
		index?: number | ReferencePointer<ChildRefsFor<T>["type"]>
	) => void
	readonly removeItem: <I extends ChildTypesFor<T>>(
		type: I,
		urls: ConceptURLMap[I] | ConceptURLMap[I][]
	) => void
	readonly removeItemByRef: (ref: ChildRefsFor<T> | ChildRefsFor<T>[]) => void
	readonly hasItem: (
		type: ChildRefsFor<T>["type"],
		url: ChildRefsFor<T>["url"]
	) => boolean
	readonly hasItemByRef: (ref: ChildRefsFor<T>) => boolean
	readonly moveItem: (
		type: ChildRefsFor<T>["type"],
		urls: ChildRefsFor<T>["url"] | ChildRefsFor<T>["url"][],
		index: number
	) => void
	readonly moveItemAfter: (
		type: ChildRefsFor<T>["type"],
		urls: ChildRefsFor<T>["url"] | ChildRefsFor<T>["url"][],
		target: ChildRefsFor<T>["url"]
	) => void
	readonly moveItemBefore: <C extends ChildRefsFor<T>>(
		type: C["type"],
		urls: C["url"] | C["url"][],
		target: C["url"]
	) => void
	readonly insertItemBefore: (
		type: ChildRefsFor<T>["type"],
		url: ChildRefsFor<T>["url"],
		target: ChildRefsFor<T>["url"]
	) => void
}
