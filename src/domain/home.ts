import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {InboxURL} from "./inbox.ts"
import type {DropboxURL} from "./dropbox.ts"
import type {ProjectRef} from "./project.ts"
import type {AreaRef} from "./area.ts"
import type {ActionRef} from "@/domain/action.ts"

export type HomeURL = AutomergeUrl & {type: "home"}

export type Home = {
	type: "home"
	inbox: InboxURL
	// drop-only inboxes
	dropboxes: DropboxURL[]
	items: (ActionRef | ProjectRef | AreaRef)[]
}

export function newHome(home: Partial<Home> & {inbox: Home["inbox"]}): Home {
	return {
		type: "home",
		dropboxes: [],
		items: [],
		...home,
	}
}
