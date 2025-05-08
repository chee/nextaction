import {createStore} from "solid-js/store"
import type {
	AnyChildURL,
	AnyParentURL,
	ChildConceptParentMap,
	ChildToValidParentTypes,
	ConceptURLMap,
} from ":concepts:"

import debug from "debug"
const log = debug("nextaction:parent-registry")

const [parentRegistry, updateParentRegistry] = createStore<
	Record<AnyChildURL, AnyParentURL>
>({})

export function registerParent<C extends keyof ChildConceptParentMap>(
	child: ConceptURLMap[C] | undefined,
	parent: ConceptURLMap[ChildToValidParentTypes[C]] | undefined
) {
	if (child && parent)
		updateParentRegistry(child as AnyChildURL, parent as AnyParentURL)
}

export function getParentURL<C extends keyof ChildToValidParentTypes>(
	url: ConceptURLMap[C]
): ConceptURLMap[ChildToValidParentTypes[C]] {
	const parent = parentRegistry[url as AnyChildURL]
	if (!url || !parent) {
		log("no parent found for", url)
	}
	return parent as ConceptURLMap[ChildToValidParentTypes[C]]
}

export {parentRegistry, updateParentRegistry}
