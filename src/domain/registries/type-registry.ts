import type {ConceptName, ConceptURLMap} from ":concepts:"
import {createStore} from "solid-js/store"

export type ConceptRegistry = {
	[K in ConceptName as ConceptURLMap[K]]: K
}

const [typeRegistry, updateTypeRegistry] = createStore<ConceptRegistry>({})

export function registerType<T extends keyof ConceptRegistry>(
	url: T | undefined,
	type: ConceptRegistry[T]
) {
	if (url) updateTypeRegistry(url, type)
}

export function getType<T extends keyof ConceptRegistry>(
	url: T
): ConceptRegistry[T] {
	return typeRegistry[url] as ConceptRegistry[T]
}

export {typeRegistry, updateTypeRegistry}

export type TypeRegistry = typeof typeRegistry
