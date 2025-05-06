import {useAction, type ActionViewModel} from "::viewmodel/action.ts"
import type {ActionURL} from "::domain/action.ts"
import {useProject, type ProjectViewModel} from "./project.ts"
import {useArea, type AreaViewModel} from "./area.ts"
import {useHeading, type HeadingViewModel} from "./heading.ts"
import type {Accessor} from "solid-js"
import type {ConceptName, ConceptViewModelMap} from "::concepts"
import type {Reference} from "::domain/reference.ts"
import type {ProjectURL} from "::domain/project.ts"
import type {AreaURL} from "::domain/area.ts"
import type {HeadingURL} from "::domain/heading.ts"

export function useVM(
	ref: Reference<"action"> | Accessor<Reference<"action">>
): ActionViewModel
export function useVM(
	ref: Reference<"project"> | Accessor<Reference<"project">>
): ProjectViewModel
export function useVM(
	ref: Reference<"area"> | Accessor<Reference<"area">>
): AreaViewModel
export function useVM(
	ref: Reference<"heading"> | Accessor<Reference<"heading">>
): HeadingViewModel

export function useVM(
	ref: Reference<ConceptName> | Accessor<Reference<ConceptName>>
): ConceptViewModelMap[ConceptName] {
	const r = typeof ref === "function" ? ref() : ref

	switch (r.type) {
		case "action":
			return useAction(() => r.url as ActionURL)
		case "project":
			return useProject(() => r.url as ProjectURL)
		case "area":
			return useArea(() => r.url as AreaURL)
		case "heading":
			return useHeading(() => r.url as HeadingURL)
		default:
			throw new Error("Invalid reference type")
	}
}

export function useViewModel<T extends ConceptName>(
	ref: Reference<T> | Accessor<Reference<T>>
): ConceptViewModelMap[T] {
	// @ts-expect-error i'm fine with this
	return useVM(ref) as ConceptViewModelMap[T]
}
