import type {AutomergeUrl} from "@automerge/automerge-repo"
import {createStore} from "solid-js/store"

export type ItemType =
	| "home"
	| "inbox"
	| "area"
	| "project"
	| "heading"
	| "action"

const [typeRegistry, updateTypeRegistry] = createStore<
	Record<AutomergeUrl, ItemType>
>({})

export function registerType(url: AutomergeUrl, type: ItemType) {
	updateTypeRegistry(url, type)
}

export function getType(url: AutomergeUrl): ItemType {
	return typeRegistry[url]
}

export {typeRegistry, updateTypeRegistry}

export type TypeRegistry = typeof typeRegistry
