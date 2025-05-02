import {useDocument} from "solid-automerge"
import {type Accessor, mapArray} from "solid-js"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {
	addReference,
	removeReference,
	moveReference,
	moveReferenceAfter,
	moveReferenceBefore,
	type AnyRef,
} from "@/domain/reference.ts"
import {
	useViewModel,
	type AnyItemViewModel,
} from "@/viewmodel/generic/useviewmodel.ts"

// todo figure out how to do a map between models and refs
// todo refs might need to be generic
export function useListViewModel<
	ItemType extends AnyItemViewModel = AnyItemViewModel,
	R extends AnyRef = AnyRef
>(url: Accessor<AutomergeUrl | undefined>) {
	const [list, handle] = useDocument<{items: R[]}>(url)
	const itemURLs = mapArray(
		() => list()?.items,
		ref => ref.url
	)
	const items = mapArray(
		() => list()?.items,
		ref => useViewModel(() => ref)
	) as Accessor<ItemType[]>

	type MaybeArray<T> = T | T[]
	type SingleTypeURL = ItemType["url"]
	type TypeURLs = MaybeArray<ItemType["url"]>
	return {
		get items() {
			return items()
		},
		get itemURLs() {
			return itemURLs()
		},
		addItem(type: ItemType["type"], urls: TypeURLs, index?: number) {
			handle()?.change(doc => addReference(doc.items, type, urls, index))
		},
		removeItem(type: ItemType["type"], urls: TypeURLs) {
			handle()?.change(doc => removeReference(doc.items, type, urls))
		},
		hasItem(type: ItemType["type"], url: SingleTypeURL) {
			return list()?.items.some(item => item.type == type && item.url == url)
		},
		moveItem(type: ItemType["type"], urls: TypeURLs, index: number) {
			handle()?.change(doc => moveReference(doc.items, type, urls, index))
		},
		moveItemAfter(
			type: ItemType["type"],
			urls: TypeURLs,
			target: SingleTypeURL
		) {
			handle()?.change(doc => moveReferenceAfter(doc.items, type, urls, target))
		},
		moveItemBefore(
			type: ItemType["type"],
			urls: TypeURLs,
			target: SingleTypeURL
		) {
			handle()?.change(doc =>
				moveReferenceBefore(doc.items, type, urls, target)
			)
		},
	}
}

export type ListViewModel<T extends AnyItemViewModel = AnyItemViewModel> = {
	readonly items: T[]
	readonly itemURLs: string[]
	addItem(type: T["type"], urls: T["url"] | T["url"][], index?: number): void
	removeItem(type: T["type"], urls: T["url"] | T["url"][]): void
	hasItem(type: T["type"], url: T["url"]): boolean
	moveItem(type: T["type"], urls: T["url"] | T["url"][], index: number): void
	moveItemAfter(
		type: T["type"],
		urls: T["url"] | T["url"][],
		target: T["url"]
	): void
	moveItemBefore(
		type: T["type"],
		urls: T["url"] | T["url"][],
		target: T["url"]
	): void
}
