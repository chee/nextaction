/* @refresh reload */

import {type AutomergeUrl, Repo} from "@automerge/automerge-repo"
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb"
import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"

const repo = new Repo({
	storage: new IndexedDBStorageAdapter(),
	network: [new BrowserWebSocketClientAdapter("wss://galaxy.observer")],
	enableRemoteHeadsGossiping: true,
})

export default repo

declare global {
	interface Window {
		repo: Repo
	}
}

self.repo = repo

/**
 * Create an repo doc and return the URL
 *
 * @param obj - The object to be converted to a URL
 * @returns
 */
export function curl<URLType extends AutomergeUrl>(obj: unknown) {
	return repo.create(obj).url as URLType
}
