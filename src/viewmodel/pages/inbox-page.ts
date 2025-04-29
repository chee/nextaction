import { useInbox } from "@/viewmodel/inbox.ts"
import { createListContext } from "@/infra/hooks/list-context.ts"
import type { ActionURL } from "@/domain/action.ts"
import { createSignal } from "solid-js"

export function useInboxPage() {
	const inbox = useInbox()
	const list = createListContext(() => inbox.actionURLs)
	const [expanded, setExpanded] = createSignal<ActionURL>()

	return {
		inbox,
		list,
		expanded,
		expand(url: ActionURL) {
			setExpanded(url)
			list.clear()
		},
		collapse() {
			const url = expanded()
			setExpanded()
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			url && list.select(url)
			// const action = useAction(() => url!)
			// if (!action.notes && !action.title) {
			// inbox.removeAction(action.url)
			// setCurrent(props.actions[index - 1].url)
			// }
		},
	}
}
