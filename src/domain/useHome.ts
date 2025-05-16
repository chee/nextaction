import {useDocument} from "solid-automerge"
import {UserContext, useUser} from "./useUser.ts"
import type {HomeShape, HomeURL} from "::shapes/home.ts"
import {type ActionRef} from "::shapes/action.ts"
import {
	isProjectRef,
	createProjectShape,
	ProjectURL,
	type ProjectShape,
} from "::shapes/project.ts"
import {useListMixin, type List} from "./mixins/list.ts"
import type {AutomergeUrl, DocHandle} from "@automerge/vanillajs"
import {decodeJSON} from "::core/util/compress.ts"
import {toast} from "::ui/components/base/toast.tsx"
import mix from "::core/util/mix.ts"
import {useContext} from "solid-js"
import defaultRepo, {curl} from "::core/sync/automerge.ts"
import {createEffect} from "solid-js"
import {
	associateTag,
	associateTags,
	tagRegistry,
} from "::registries/tag-registry.ts"
import type {AnyDoableURL} from ":concepts:"
import {tagItem} from "::shapes/tag.ts"

declare global {
	interface Window {
		home(): DocHandle<HomeShape> | undefined
	}
}

export function useHome(repo = defaultRepo): Home {
	const user = useUser()

	const [home, handle] = useDocument<HomeShape>(() => user.homeURL, {repo})
	self.home = handle

	// todo loses reactivity?
	const list = useListMixin(() => user.homeURL, "home")

	const inbox = useListMixin(() => home()?.inbox, "inbox")

	createEffect(() => {
		for (const tag of Object.values(home()?.tags ?? {})) {
			for (const item of Object.keys(tag.items)) {
				associateTag(item as AnyDoableURL, tag.title)
			}
		}
	})

	const model = mix({
		type: "home" as const,
		list,
		get keyed() {
			return list.keyed
		},
		get flat() {
			return list.flat
		},
		get url() {
			return handle()?.url as HomeURL
		},
		get inbox() {
			return inbox
		},
		// todo tags should be its own model
		get tags() {
			return home()?.tags ?? {}
		},
		get tagTitles() {
			return Object.values(home()?.tags || {}).map(tag => tag.title)
		},
		setTagsFor(url: AnyDoableURL, tags: string[]) {
			handle()?.change(doc => {
				for (const tag of tags) {
					if (!doc.tags[tag]) {
						doc.tags[tag] = {type: "tag", title: tag, items: {}}
					}
					tagItem(doc.tags[tag], url)
				}
			})
		},
		createProject(project?: ProjectShape) {
			const url = curl<ProjectURL>(createProjectShape(project))
			list.addItem("project", url)
			return url
		},
		importProject(string: string) {
			const json = decodeJSON(string)
			if (isProjectRef(json)) {
				list.addItem("project", json.url)
			} else {
				toast.show({
					title: "Invalid project",
					body: "maybe ask your friend to send it again??",
					modifiers: ["error"],
				})
			}
		},
		adoptActionFromInbox(ref: ActionRef) {
			if (inbox.hasItemByRef(ref)) {
				inbox.removeItemByRef(ref)
			}
			if (!list.hasItemByRef(ref)) {
				list.addItemByRef(ref, list.items.length)
			}
		},
		giveActionToInbox(ref: ActionRef) {
			if (list.hasItemByRef(ref)) {
				list.removeItemByRef(ref)
			}
			if (!inbox.hasItemByRef(ref)) {
				inbox.addItemByRef(ref, inbox.items.length)
			}
		},
	})

	return model
}

export interface Home {
	type: "home"
	url: HomeURL
	list: List<"home">
	inbox: List<"inbox">
	keyed: List<"home">["keyed"]
	flat: List<"home">["flat"]
	tags: Record<string, {title: string; items: Record<string, true>}>
	tagTitles: string[]

	createProject(project?: ProjectShape): ProjectURL
	importProject(string: string): void
	adoptActionFromInbox(ref: ActionRef): void
	giveActionToInbox(ref: ActionRef): void
}

export type Inbox = Home["inbox"]

export function useHomeContext() {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error("useHomeContext must be used within a UserContext.Provider")
	}
	return context.home
}
