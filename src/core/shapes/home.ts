import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {InboxURL} from "./inbox.ts"
import type {ProjectRef} from "./project.ts"
import type {DropboxURL} from "./dropbox.ts"
import type {AreaRef} from "./area.ts"
import type {ActionRef} from "./action.ts"
import type {Tag} from "./tag.ts"

export type HomeURL = AutomergeUrl & {type: "home"}

export type HomeShape = {
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

export function createHomeShape(
	home: Partial<HomeShape> & {inbox: HomeShape["inbox"]}
): HomeShape {
	return {
		type: "home",
		dropboxes: [],
		sources: [],
		items: [],
		tags: [],
		...home,
	}
}
