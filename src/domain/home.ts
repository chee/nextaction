import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {InboxURL} from "./inbox.ts"
import type {DropboxURL} from "./dropbox.ts"
import type {ProjectURL} from "./project.ts"
import type {AreaURL} from "./area.ts"

export type HomeURL = AutomergeUrl & {type: "home"}

export interface Home {
	type: "home"
	inbox: InboxURL
	// drop-only inboxes
	dropboxes: DropboxURL[]
	items: (ProjectURL | AreaURL)[]
}

export function newHome(home: Partial<Home> & {inbox: Home["inbox"]}): Home {
	return {
		type: "home",
		dropboxes: [],
		items: [],
		...home,
	}
}
