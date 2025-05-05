import {useDocument} from "solid-automerge"
import {type Accessor, mapArray} from "solid-js"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {
	addReference,
	removeReference,
	moveReference,
	moveReferenceAfter,
	moveReferenceBefore,
	removeReferenceByRef,
	type AnyRef,
	type ReferencePointer,
	addReferenceByRef,
} from "@/domain/reference.ts"
import {useViewModel} from "@/viewmodel/useviewmodel.ts"
import {registerParent, type ParentType} from "@/infra/parent-registry.ts"
import {registerType} from "../../infra/type-registry.ts"
import {createEffect} from "solid-js"
import repo from "../../infra/sync/automerge-repo.ts"
import flattenTree from "../../infra/lib/flattenTree.ts"
import {createMemo} from "solid-js"

// todo figure out how to do a map between models and refs
// todo refs might need to be generic
export function useListViewModel<
	ItemType extends {type: R["type"]; url: R["url"]},
	R extends AnyRef = AnyRef
>(url: Accessor<AutomergeUrl | undefined>, type: ParentType) {
	const [list, handle] = useDocument<{items: R[]}>(url, {repo: repo})
	createEffect(() => {
		// todo this should be done in the individual viewmodels
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		url() && registerType(url()!, type)
	})
	createEffect(() => {
		if (list()?.items) {
			for (const item of list()!.items) {
				registerType(item.url as AutomergeUrl, item.type)
				registerParent(item.url as AutomergeUrl, url()!)
			}
		}
	})
	const itemURLs = mapArray(
		() => list()?.items,
		ref => {
			registerType(ref.url as AutomergeUrl, ref.type)
			registerParent(ref.url as AutomergeUrl, url()!)
			return ref.url
		}
	)

	// @ts-expect-error todo fix this
	const items = mapArray(
		() => list()?.items,
		ref => {
			try {
				return useViewModel(() => ref)
			} catch (error) {
				console.error({error})
				return []
			}
		}
	) as Accessor<ItemType[]>

	type MaybeArray<T> = T | T[]
	type SingleTypeURL = R["url"]
	type TypeURLs = MaybeArray<R["url"]>

	const keyed = createMemo(() => {
		return items().reduce((acc, item) => {
			acc[item.url] = item
			return acc
		}, {} as Record<SingleTypeURL, ItemType>)
	})
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
			// @ts-expect-error todo fix this
			return flattenTree(items())
		},
		get keyed() {
			return keyed()
		},
		addItem(
			type: R["type"],
			urls: TypeURLs,
			index?: number | ReferencePointer<R["type"]>
		) {
			handle()?.change(doc => addReference(doc.items, type, urls, index))
		},
		addItemByRef(ref: R | R[], index?: number | ReferencePointer<R["type"]>) {
			handle()?.change(doc => addReferenceByRef(doc.items, ref, index))
		},
		removeItem(type: R["type"], urls: TypeURLs) {
			handle()?.change(doc => removeReference(doc.items, type, urls))
		},
		removeItemByRef(ref: R | R[]) {
			handle()?.change(doc => {
				removeReferenceByRef(doc.items, ref)
			})
		},
		hasItem(type: R["type"], url: SingleTypeURL) {
			return list()?.items.some(item => item.type == type && item.url == url)
		},
		hasItemByRef(ref: R) {
			return list()?.items.some(
				item => item.type == ref.type && item.url == ref.url
			)
		},
		moveItem(type: R["type"], urls: TypeURLs, index: number) {
			handle()?.change(doc => moveReference(doc.items, type, urls, index))
		},
		moveItemAfter(type: R["type"], urls: TypeURLs, target: SingleTypeURL) {
			handle()?.change(doc => moveReferenceAfter(doc.items, type, urls, target))
		},
		moveItemBefore(type: R["type"], urls: TypeURLs, target: SingleTypeURL) {
			handle()?.change(doc =>
				moveReferenceBefore(doc.items, type, urls, target)
			)
		},
		insertItemBefore(
			type: R["type"],
			url: SingleTypeURL,
			target: SingleTypeURL
		) {
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

export type ListViewModel<ItemType, R extends AnyRef = AnyRef> = ReturnType<
	typeof useListViewModel<ItemType, R>
>
