import type {AutomergeUrl} from "@automerge/automerge-repo"
import {createStore} from "solid-js/store"

export type ParentType = "home" | "inbox" | "area" | "project" | "heading"

const [parentRegistry, updateParentRegistry] = createStore<
	Record<AutomergeUrl, AutomergeUrl>
>({})

export function registerParent(url: AutomergeUrl, parent: AutomergeUrl) {
	updateParentRegistry(url, parent)
}

export function getParentURL(url: AutomergeUrl): AutomergeUrl {
	return parentRegistry[url]
}

export {parentRegistry, updateParentRegistry}

export type ParentRegistry = typeof parentRegistry
