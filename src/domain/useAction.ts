import type {Accessor} from "solid-js"
import {
	ActionShape,
	createActionShape,
	type ActionURL,
} from "::shapes/action.ts"
import {useDocument} from "solid-automerge"
import {useDoableMixin, type Doable} from "./mixins/doable.ts"
import mix from "::core/util/mix.ts"
import {useNotableMixin, type NotableMixin} from "./mixins/notable.ts"
import {useTitleableMixin, type TitleableMixin} from "./mixins/titleable.ts"
import type {Reference, ReferencePointer} from "::shapes/reference.ts"
import defaultRepo, {curl} from "::core/sync/automerge.ts"

export function useAction(
	url: Accessor<ActionURL>,
	repo = defaultRepo
): Action {
	const [action, handle] = useDocument<ActionShape>(url, {repo})
	const notable = useNotableMixin(action, handle)
	const titleable = useTitleableMixin(action, handle)
	const doable = useDoableMixin(url)

	const vm = mix(doable, notable, titleable, {
		type: "action" as const,
		get url() {
			return handle()?.url as ActionURL
		},
		get deleted() {
			return action() ? action()?.deleted ?? false : true
		},
		undelete() {
			handle()?.change(project => {
				project.deleted = false
			})
		},
		delete() {
			handle()?.change(action => {
				action.deleted = true
			})
		},
		get checklist() {
			return action()?.checklist ?? []
		},
		toString() {
			const string = `- [${doable.closed ? "x" : " "}] ${action()?.title ?? ""}`
			if (notable.notes?.trim()) {
				return `${string}\n\t${notable.notes}`.trim()
			}
			return string.trim()
		},
		asReference(): Reference<"action"> {
			return {
				type: "action" as const,
				url: handle()?.url as ActionURL,
			}
		},
		asPointer(above?: boolean): ReferencePointer<"action"> {
			return {
				type: "action" as const,
				url: handle()?.url as ActionURL,
				above,
			}
		},
	})

	return vm
}

useAction.new = (action?: Partial<ActionShape>) => {
	return curl<ActionURL>(createActionShape(action))
}

export interface Action extends Doable, NotableMixin, TitleableMixin {
	readonly type: "action"
	readonly url: ActionURL
	delete(): void
	undelete(): void
	asReference(): Reference<"action">
	asPointer(above?: boolean): ReferencePointer<"action">
}

export function isAction(action: unknown): action is Action {
	return (action as Action).type === "action"
}
