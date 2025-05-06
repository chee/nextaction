import {createMemo} from "solid-js"
import {isClosed} from "@/domain/generic/doable.ts"
import type {ProjectURL} from "@/domain/project.ts"
import {useHome} from "@/viewmodel/home.ts"
import flattenTree from "@/infra/lib/flattenTree.ts"
import {isAction} from "@/domain/action.ts"
import type {ActionViewModel} from "../../../viewmodel/action.ts"

export function useProjectProgress(
	projectURL: () => ProjectURL
): [() => number, () => number] {
	const home = useHome()
	const project = createMemo(() => home.keyed[projectURL()])
	const actions = createMemo(
		() =>
			flattenTree(project()?.items).filter(
				i => isAction(i) && !i.deleted
			) as ActionViewModel[]
	)
	const total = createMemo(() => actions().length)
	const closed = createMemo(() => actions().filter(a => isClosed(a)).length)
	const open = createMemo(() => total() - closed())
	const progress = createMemo(() =>
		total() > 0 ? Math.round((closed() / total()) * 100) : 0
	)

	return [progress, open] as const
}
