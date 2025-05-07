import {useAction, type Action} from "::domain/entities/useAction.ts"
import type {ActionURL} from "::shapes/action.ts"
import {useProject, type Project} from "./entities/useProject.ts"
import {useArea, type Area} from "./entities/useArea.ts"
import {useHeading, type Heading} from "./entities/useHeading.ts"
import type {Accessor} from "solid-js"
import type {ConceptEntityMap, ConceptName} from ":concepts:"
import type {Reference} from "::shapes/reference.ts"
import type {ProjectURL} from "::shapes/project.ts"
import type {AreaURL} from "::shapes/area.ts"
import type {HeadingURL} from "::shapes/heading.ts"

function useDE<T extends ConceptName>(
	ref: Reference<T> | Accessor<Reference<T>>
): ConceptEntityMap[T]
function useDE(ref: Reference<"action"> | Accessor<Reference<"action">>): Action
function useDE(
	ref: Reference<"project"> | Accessor<Reference<"project">>
): Project
function useDE(ref: Reference<"area"> | Accessor<Reference<"area">>): Area
function useDE(
	ref: Reference<"heading"> | Accessor<Reference<"heading">>
): Heading
function useDE(
	ref: Reference<ConceptName> | Accessor<Reference<ConceptName>>
): ConceptEntityMap[ConceptName] {
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

export function useEntity<T extends ConceptName>(
	ref: Reference<T> | Accessor<Reference<T>>
): ConceptEntityMap[T] {
	return useDE(ref) as ConceptEntityMap[T]
}
