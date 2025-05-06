import {createContext} from "solid-js"
import type {AnyConceptURL} from "../concepts.ts"
import {ReactiveMap} from "@solid-primitives/map"
import {useContext} from "solid-js"

export default makeViewModelCache()

export function makeViewModelCache() {
	const cache = new ReactiveMap<AnyConceptURL, unknown>()
	return {
		get: cache.get.bind(cache),
		set: cache.set.bind(cache),
		has() {
			return false
		},
		clear: cache.clear.bind(cache),
	}
}
