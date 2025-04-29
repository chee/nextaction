import {useDocument} from "solid-automerge"
import {type Accessor, mapArray} from "solid-js"
import {
	type ActionList,
	addAction,
	moveAction,
	removeAction,
} from "@/domain/action-list.ts"
import {type Action, type ActionURL, newAction} from "@/domain/action.ts"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {useAction} from "./action.ts"
import {curl} from "@/infra/sync/automerge-repo.ts"

export function useActionList(url: Accessor<AutomergeUrl | undefined>) {
	const [list, handle] = useDocument<ActionList>(url)
	const actions = mapArray(
		() => list()?.actions,
		url => useAction(() => url)
	)
	return {
		get actions() {
			return actions()
		},
		get actionURLs() {
			return list()?.actions ?? []
		},
		newAction(action?: Partial<Action>, index?: number) {
			const url = curl(newAction(action))
			handle()?.change(addAction(url, index))
			return url as ActionURL
		},
		addAction(...urls: ActionURL[]) {
			handle()?.change(doc => {
				for (const url of urls) {
					addAction(url)(doc)
				}
			})
		},
		removeAction(...urls: ActionURL[]) {
			handle()?.change(doc => {
				for (const url of urls) {
					removeAction(url)(doc)
				}
			})
		},
		moveAction(urls: ActionURL | ActionURL[], index: number) {
			if (!Array.isArray(urls)) {
				urls = [urls]
			}
			handle()?.change(doc => {
				urls.forEach(url => {
					moveAction(url, index)(doc)
				})
			})
		},
	}
}

export type ActionListViewModel = ReturnType<typeof useActionList>
