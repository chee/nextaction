import {type Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {
	Doable,
	isClosed,
	setWhenFromFancy,
	toggleCanceled,
	toggleCompleted,
} from "::domain/generic/doable.ts"
import repo from "::infra/sync/automerge-repo.ts"
import type {ProjectURL} from "::domain/project.ts"
import type {ActionURL} from "::domain/action.ts"

export function useDoableMixin(
	url: Accessor<ActionURL | ProjectURL | undefined>
): DoableViewModel {
	const [item, handle] = useDocument<Doable>(url, {repo: repo})

	return {
		get stateChanged() {
			return item()?.stateChanged ?? null
		},
		get state() {
			return item()?.state ?? "open"
		},
		get closed() {
			return Boolean(item() && isClosed(item()!))
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
			handle()?.change(doable => {
				delete doable.when
			})
		},
		setWhen(when: Parameters<typeof setWhenFromFancy>[1]) {
			handle()?.change(doable => {
				setWhenFromFancy(doable, when)
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

export interface DoableViewModel {
	readonly stateChanged: Date | null
	readonly state: Doable["state"]
	readonly closed: boolean
	toggleCompleted(force?: boolean): void
	toggleCanceled(force?: boolean): void
	readonly when: Doable["when"]
	clearWhen(): void
	setWhen(when: Parameters<typeof setWhenFromFancy>[1]): void
	deleted: boolean
}
