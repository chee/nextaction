import {type Accessor} from "solid-js"
import {
	DoableShape,
	isCanceled,
	isClosed,
	isCompleted,
	setWhenFromFancy,
	toggleCanceled,
	toggleCompleted,
} from "::shapes/mixins/doable.ts"
import type {AnyDoableShape} from ":concepts:"
import type {DocHandle} from "@automerge/automerge-repo/slim"
import {createMemo} from "solid-js"

export function withDoable(
	item: Accessor<AnyDoableShape | undefined>,
	handle: Accessor<DocHandle<AnyDoableShape> | undefined>
): Doable {
	const stateChanged = createMemo(() => item()?.stateChanged ?? null)
	const state = createMemo(() => item()?.state ?? "open")
	const closed = createMemo(() => Boolean(item() && isClosed(item()!)))
	const completed = createMemo(() => Boolean(item() && isCompleted(item()!)))
	const canceled = createMemo(() => Boolean(item() && isCanceled(item()!)))
	const when = createMemo(() => item()?.when ?? null)
	const deleted = createMemo(() => (item() ? item()!.deleted ?? false : true))

	return {
		get stateChanged() {
			return stateChanged()
		},
		get state() {
			return state()
		},
		get closed() {
			return closed()
		},
		get completed() {
			return completed()
		},
		get canceled() {
			return canceled()
		},
		get when(): DoableShape["when"] {
			return when()
		},
		get deleted() {
			return deleted()
		},
		set deleted(value: boolean) {
			handle()?.change(item => {
				item.deleted = value
			})
		},
		delete() {
			handle()?.change(item => {
				item.deleted = true
			})
		},
		toggleCompleted(force?: boolean) {
			handle()?.change(item => toggleCompleted(item, force))
		},
		toggleCanceled(force?: boolean) {
			handle()?.change(item => toggleCanceled(item, force))
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
	delete(): void
	setWhen(when: Parameters<typeof setWhenFromFancy>[1]): void
	deleted: boolean
}
