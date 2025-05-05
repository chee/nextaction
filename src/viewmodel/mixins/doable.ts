import {type Accessor} from "solid-js"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import {useDocument} from "solid-automerge"
import {
	Doable,
	isClosed,
	setWhenFromFancy,
	toggleCanceled,
	toggleCompleted,
} from "@/domain/generic/doable.ts"
import type {ActionViewModel} from "@/viewmodel/action.ts"
import type {ProjectViewModel} from "@/viewmodel/project.ts"
import repo from "../../infra/sync/automerge-repo.ts"

export type AnyDoableViewModel = ActionViewModel | ProjectViewModel
export function useDoableMixin(url: Accessor<AutomergeUrl | undefined>) {
	const [item, handle] = useDocument<Doable>(url, {repo: repo})

	return {
		get stateChanged() {
			return item()?.stateChanged ?? null
		},
		get state() {
			return item()?.state ?? "open"
		},
		get closed() {
			return item() && isClosed(item()!)
		},
		toggleCompleted(force?: boolean) {
			handle()?.change(item => toggleCompleted(item, force))
		},
		toggleCanceled(force?: boolean) {
			handle()?.change(item => toggleCanceled(item, force))
		},
		get when(): Doable["when"] {
			return item()?.when ?? null
		},
		clearWhen() {
			handle()?.change(action => {
				delete action.when
			})
		},
		setWhen(when: Parameters<typeof setWhenFromFancy>[1]) {
			handle()?.change(action => {
				setWhenFromFancy(action, when)
			})
		},
		get deleted() {
			return item()?.deleted ?? false
		},
		set deleted(value: boolean) {
			handle()?.change(item => {
				item.deleted = value
			})
		},
	}
}

export type DoableViewModel = ReturnType<typeof useDoableMixin>
