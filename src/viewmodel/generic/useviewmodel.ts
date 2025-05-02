import type {AnyRef} from "@/domain/reference.ts"
import {useAction, type ActionViewModel} from "@/viewmodel/action.ts"
import type {ActionURL} from "@/domain/action.ts"
import {useProject, type ProjectViewModel} from "../project.ts"
import {useArea, type AreaViewModel} from "../area.ts"
import type {ProjectURL} from "@/domain/project.ts"
import type {AreaURL} from "@/domain/area.ts"
import {useHeading, type HeadingViewModel} from "../heading.ts"
import type {HeadingURL} from "../../domain/heading.ts"

export type AnyItemViewModel =
	| ActionViewModel
	| ProjectViewModel
	| AreaViewModel
	| HeadingViewModel

// todo fix types so the right view model is returned for the ref
export function useViewModel(ref: () => AnyRef): AnyItemViewModel {
	const r = ref()
	if (r.type === "action") {
		return useAction(() => r.url as ActionURL)
	}
	if (r.type === "project") {
		return useProject(() => r.url as ProjectURL)
	}
	if (r.type === "area") {
		return useArea(() => r.url as AreaURL)
	}
	if (r.type == "heading") {
		return useHeading(() => r.url as HeadingURL)
	}
	throw new Error("Invalid reference type")
}
