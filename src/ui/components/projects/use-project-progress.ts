import {createMemo} from "solid-js"
import {isClosed} from "@/domain/generic/doable.ts"
import type {ActionViewModel} from "@/viewmodel/action.ts"

export function useProjectProgress(
	actions: () => ActionViewModel[]
): [() => number, () => number] {
	const total = createMemo(() => actions().filter(a => !a.deleted).length)
	const closed = createMemo(
		() => actions().filter(a => !a.deleted && isClosed(a)).length
	)
	const open = createMemo(() => total() - closed())
	const progress = createMemo(() =>
		total() > 0 ? Math.round((closed() / total()) * 100) : 0
	)

	return [progress, open] as const
}
