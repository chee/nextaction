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

export function useActionList(url: Accessor<AutomergeUrl | undefined>) {
	const list = useListViewModel<ActionRef>(url)

	return {
		get actions() {
			return list.items
		},
		get actionURLs() {
			return list.itemURLs
		},
		newAction(action?: Partial<Action>, index?: number) {
			const url = curl(newAction(action))
			list.addItem("action", url, index)
			return url as ActionURL
		},
		addAction(urls: ActionURL | ActionURL[], index?: number) {
			list.addItem("action", urls, index)
		},
		removeAction(urls: ActionURL | ActionURL[]) {
			list.removeItem("action", urls)
		},
		hasAction(url: ActionURL) {
			return list.hasItem("action", url)
		},
		moveAction(urls: ActionURL | ActionURL[], index: number) {
			list.moveItem("action", urls, index)
		},
		moveActionAfter(urls: ActionURL | ActionURL[], target: ActionURL) {
			list.moveItemAfter("action", urls, target)
		},
		moveActionBefore(urls: ActionURL | ActionURL[], target: ActionURL) {
			list.moveItemBefore("action", urls, target)
		},
	}
}

export type ActionListViewModel = ReturnType<typeof useActionList>
