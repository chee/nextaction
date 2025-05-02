import {type Accessor} from "solid-js"
import {
	type Action,
	type ActionRef,
	type ActionURL,
	newAction,
} from "@/domain/action.ts"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {curl} from "@/infra/sync/automerge-repo.ts"
import {useListViewModel} from "@/viewmodel/generic/list.ts"
import type {ActionViewModel} from "../action.ts"
import mergeDescriptors from "merge-descriptors"
import {partial} from "@/infra/lib/partial.ts"

export function useActionList(url: Accessor<AutomergeUrl | undefined>) {
	const list = useListViewModel<ActionViewModel, ActionRef>(url)

	return mergeDescriptors(list, {
		get actions() {
			return list.items
		},
		get actionURLs() {
			return list.itemURLs
		},
		newAction(action?: Partial<Action>, index?: number) {
			const url = curl<ActionURL>(newAction(action))
			list.addItem("action", url, index)
			return url
		},
		addAction: partial(list.addItem, "action"),
		removeAction: partial(list.removeItem, "action"),
		hasAction: partial(list.hasItem, "action"),
		moveAction: partial(list.moveItem, "action"),
		moveActionAfter: partial(list.moveItemAfter, "action"),
		moveActionBefore: partial(list.moveItemBefore, "action"),
	})
}

export type ActionListViewModel = ReturnType<typeof useActionList>
