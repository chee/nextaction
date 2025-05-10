import {useAction, type Action} from "::domain/useAction.ts"
import type {ActionURL} from "::shapes/action.ts"
import {useProject, type Project} from "./useProject.ts"
import {useHeading, type Heading} from "./useHeading.ts"
import type {Accessor} from "solid-js"
import type {ConceptModelMap, ConceptName, ConceptURLMap} from ":concepts:"
import {referAfterDark, type Reference} from "::shapes/reference.ts"
import type {ProjectURL} from "::shapes/project.ts"
import type {AreaURL} from "::shapes/area.ts"
import type {HeadingURL} from "::shapes/heading.ts"
import {useArea, type Area} from "./useArea.ts"
import {getType} from "::registries/type-registry.ts"
import {useHomeContext} from "./useHome.ts"

function useDE<T extends ConceptName>(
	ref: Reference<T> | Accessor<Reference<T>>
): ConceptModelMap[T]
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
): ConceptModelMap[ConceptName] {
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

export function useModel<T extends ConceptName>(
	ref: Reference<T> | Accessor<Reference<T>>
): ConceptModelMap[T] {
	return useDE(ref) as ConceptModelMap[T]
}

// don't use this in a viewmodel, or in home, or during startup
export function useModelAfterDark<T extends ConceptName>(
	url: ConceptURLMap[T]
): ConceptModelMap[T] {
	const type = getType(url)
	if (type == "home") {
		return useHomeContext().list as ConceptModelMap[T]
	} else if (type == "inbox") {
		return useHomeContext().inbox as ConceptModelMap[T]
	} else return useModel(() => referAfterDark(url))
}
