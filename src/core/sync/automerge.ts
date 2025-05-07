/* @refresh reload */
import {Repo} from "@automerge/automerge-repo"
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb"
import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import type {AnyConceptURL} from ":concepts:"
import type {UserURL} from "::shapes/user.ts"

const defaultRepo = new Repo({
	storage: new IndexedDBStorageAdapter(),
	network: [
		// new BrowserWebSocketClientAdapter("wss://sync.automerge.org"),

		new BrowserWebSocketClientAdapter("wss://galaxy.observer"),
	],
	enableRemoteHeadsGossiping: true,
})

export default defaultRepo

declare global {
	interface Window {
		repo: Repo
	}
}

self.repo = defaultRepo

/**
 * Create an repo doc and return the URL
 *
 * @param obj - The object to be converted to a URL
 * @returns
 */
export function curl<T extends AnyConceptURL | UserURL>(obj: unknown) {
	return defaultRepo.create(obj).url as T
}
