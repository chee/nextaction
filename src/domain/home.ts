import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {InboxURL} from "./inbox.ts"
import type {DropboxURL} from "./dropbox.ts"
import type {ProjectRef} from "./project.ts"
import type {AreaRef} from "./area.ts"
import type {ActionRef} from "@/domain/action.ts"
import type {Tag} from "./tag.ts"

export type HomeURL = AutomergeUrl & {type: "home"}

export type Home = {
	type: "home"
	inbox: InboxURL
	items: (ActionRef | ProjectRef | AreaRef)[]
	// drop-only inboxes
	// todo think about this.
	// when you give someone a dropbox link, it also should create an internal
	// one. and changes to that should then be visible in the inbox. but they
	// shouldn't get your REAL inbox url!
	dropboxes: DropboxURL[]
	sources: DropboxURL[]
	tags: Tag[]
}

export function newHome(home: Partial<Home> & {inbox: Home["inbox"]}): Home {
	return {
		type: "home",
		dropboxes: [],
		sources: [],
		items: [],
		tags: [],
		...home,
	}
}
