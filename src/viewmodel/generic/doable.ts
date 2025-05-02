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

export type AnyDoableViewModel = ActionViewModel | ProjectViewModel
export function useDoable(url: Accessor<AutomergeUrl | undefined>) {
	const [item, handle] = useDocument<Doable>(url)

	return {
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
			return item()?.when
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
	}
}

export type DoableViewModel = ReturnType<typeof useDoable>
