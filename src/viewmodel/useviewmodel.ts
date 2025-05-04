import type {AnyRef} from "@/domain/reference.ts"
import {useAction, type ActionViewModel} from "@/viewmodel/action.ts"
import type {ActionURL} from "@/domain/action.ts"
import {useProject, type ProjectViewModel} from "./project.ts"
import {useArea, type AreaViewModel} from "./area.ts"
import type {ProjectURL} from "@/domain/project.ts"
import type {AreaURL} from "@/domain/area.ts"
import {useHeading, type HeadingViewModel} from "./heading.ts"
import type {HeadingURL} from "@/domain/heading.ts"

// todo fix types so the right view model is returned for the ref
export function useViewModel(
	ref: () => {type: AnyRef["type"]; url: AnyRef["url"]}
): ActionViewModel | ProjectViewModel | AreaViewModel | HeadingViewModel {
	const r = ref()
	if (r.type === "action") {
		return useAction(() => r.url as ActionURL) as ActionViewModel
	}
	if (r.type === "project") {
		return useProject(() => r.url as ProjectURL) as ProjectViewModel
	}
	if (r.type === "area") {
		return useArea(() => r.url as AreaURL) as AreaViewModel
	}
	if (r.type == "heading") {
		return useHeading(() => r.url as HeadingURL) as HeadingViewModel
	}
	throw new Error("Invalid reference type")
}
