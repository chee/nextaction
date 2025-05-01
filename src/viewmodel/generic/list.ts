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
import {useViewModel} from "@/viewmodel/generic/useviewmodel.ts"

export type ListViewModel = ReturnType<typeof useListViewModel>

export function useListViewModel<T extends AnyRef>(
	url: Accessor<AutomergeUrl | undefined>
) {
	const [list, handle] = useDocument<{items: T[]}>(url)
	const itemURLs = mapArray(
		() => list()?.items,
		ref => ref.url
	)
	const items = mapArray(
		() => list()?.items,
		ref => useViewModel(() => ref)
	)
	type MaybeArray<T> = T | T[]
	type SingleTypeURL = T["url"]
	type TypeURLs = MaybeArray<T["url"]>
	return {
		get items() {
			return items()
		},
		get itemURLs() {
			return itemURLs()
		},
		addItem(type: T["type"], urls: TypeURLs, index?: number) {
			handle()?.change(doc => addReference(doc.items, type, urls, index))
		},
		removeItem(type: T["type"], urls: TypeURLs) {
			handle()?.change(doc => removeReference(doc.items, type, urls))
		},
		hasItem(type: T["type"], url: SingleTypeURL) {
			return list()?.items.some(item => item.type == type && item.url == url)
		},
		moveItem(type: T["type"], urls: TypeURLs, index: number) {
			handle()?.change(doc => moveReference(doc.items, type, urls, index))
		},
		moveItemAfter(type: T["type"], urls: TypeURLs, target: SingleTypeURL) {
			handle()?.change(doc => moveReferenceAfter(doc.items, type, urls, target))
		},
		moveItemBefore(type: T["type"], urls: TypeURLs, target: SingleTypeURL) {
			handle()?.change(doc =>
				moveReferenceBefore(doc.items, type, urls, target)
			)
		},
	}
}
