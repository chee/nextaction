import type {Accessor} from "solid-js"
import {Action, type ActionURL} from "::domain/action.ts"
import {useDocument} from "solid-automerge"
import {useDoableMixin, type DoableViewModel} from "./mixins/doable.ts"
import mix from "::infra/lib/mix.ts"
import {useNotableMixin, type NotableViewModel} from "./mixins/notable.ts"
import {useTitleableMixin, type TitleableViewModel} from "./mixins/titleable.ts"
import repo from "::infra/sync/automerge-repo.ts"
import type {Reference, ReferencePointer} from "::domain/reference.ts"

export function useAction(url: Accessor<ActionURL>): ActionViewModel {
	const [action, handle] = useDocument<Action>(url, {repo})
	const notable = useNotableMixin(action, handle)
	const titleable = useTitleableMixin(action, handle)
	const doable = useDoableMixin(url)

	const vm = mix(doable, notable, titleable, {
		type: "action" as const,
		get url() {
			return handle()?.url as ActionURL
		},
		get deleted() {
			return action()?.deleted ?? false
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

export interface ActionViewModel
	extends DoableViewModel,
		NotableViewModel,
		TitleableViewModel {
	readonly type: "action"
	readonly url: ActionURL
	delete(): void
	asReference(): Reference<"action">
	asPointer(above?: boolean): ReferencePointer<"action">
}

export function isActionViewModel(action: unknown): action is ActionViewModel {
	return (action as ActionViewModel).type === "action"
}
