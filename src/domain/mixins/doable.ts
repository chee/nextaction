import {createEffect, type Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {
	DoableShape,
	isCanceled,
	isClosed,
	isCompleted,
	setWhenFromFancy,
	toggleCanceled,
	toggleCompleted,
} from "::shapes/mixins/doable.ts"
import type {ProjectURL} from "::shapes/project.ts"
import type {ActionURL} from "::shapes/action.ts"
import defaultRepo from "::core/sync/automerge.ts"

export function useDoableMixin(
	url: Accessor<ActionURL | ProjectURL | undefined>,
	repo = defaultRepo
): Doable {
	const [item, handle] = useDocument<DoableShape>(url, {repo})

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
		get completed() {
			return isCompleted(item()!)
		},
		get canceled() {
			return isCanceled(item()!)
		},
		toggleCompleted(force?: boolean) {
			handle()?.change(item => toggleCompleted(item, force))
		},
		toggleCanceled(force?: boolean) {
			handle()?.change(item => toggleCanceled(item, force))
		},
		get when(): DoableShape["when"] {
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
			return item() ? item()!.deleted ?? false : true
		},
		set deleted(value: boolean) {
			handle()?.change(item => {
				item.deleted = value
			})
		},
	}
}

export interface Doable {
	readonly stateChanged: Date | null
	readonly state: DoableShape["state"]
	readonly closed: boolean
	readonly completed: boolean
	readonly canceled: boolean
	toggleCompleted(force?: boolean): void
	toggleCanceled(force?: boolean): void
	readonly when: DoableShape["when"]
	clearWhen(): void
	setWhen(when: Parameters<typeof setWhenFromFancy>[1]): void
	deleted: boolean
}
