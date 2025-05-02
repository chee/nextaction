import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {useCodemirrorAutomerge} from "@/infra/editor/codemirror.ts"
import {useDoable} from "./generic/doable.ts"
import mergeDescriptors from "merge-descriptors"
import type {Area, AreaURL} from "@/domain/area.ts"
import type {ProjectViewModel} from "./project.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"

export function useArea(url: Accessor<AreaURL>) {
	const [area, handle] = useDocument<Area>(url)
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])
	const notesSyncExtension = useCodemirrorAutomerge(handle, ["notes"])
	const doable = useDoable(url)

	return mergeDescriptors(doable, {
		type: "area" as const,
		get icon() {
			return area()?.icon ?? "🗃️"
		},
		get url() {
			return handle()?.url as AreaURL
		},
		get title() {
			return area()?.title ?? ""
		},
		// todo tags
		// todo move to a useNoteable
		get notes() {
			return area()?.notes ?? ""
		},
		get notesSyncExtension() {
			return notesSyncExtension()
		},
		get titleSyncExtension() {
			return titleSyncExtension()
		},
	})
}

export type AreaViewModel = {
	type: "area"
	url: AreaURL
	title: string
	notes: string
	icon: string
}

export function isAreaViewModel(area: unknown): area is AreaViewModel {
	return (area as AreaViewModel).type === "area"
}

export function isAreaChildViewModel(
	child: unknown
): child is ProjectViewModel | ActionViewModel {
	return isAreaViewModel(child) || isActionViewModel(child)
}
