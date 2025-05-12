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
import type {DocHandle} from "@automerge/automerge-repo"
import {decodeJSON} from "::core/util/compress.ts"
import {toast} from "::ui/components/base/toast.tsx"
import mix from "::core/util/mix.ts"
import {useContext} from "solid-js"
import defaultRepo, {curl} from "::core/sync/automerge.ts"

declare global {
	interface Window {
		home(): DocHandle<HomeShape> | undefined
	}
}

export function useHome(repo = defaultRepo): () => Home {
	const user = useUser()

	const [home, homeHandle] = useDocument<HomeShape>(() => user.homeURL, {repo})
	const [_inbox, inboxHandle] = useDocument<HomeShape>(() => home()?.inbox, {
		repo,
	})
	self.home = homeHandle

	const homeList = useListMixin(homeHandle)

	const inboxList = useListMixin(inboxHandle)

	const vm = () =>
		mix({
			type: "home" as const,
			list: homeList,
			get keyed() {
				return homeList.keyed
			},
			get flat() {
				return homeList.flat
			},
			get url() {
				return homeHandle()?.url as HomeURL
			},
			get inbox() {
				return inboxList
			},
			createProject(project?: ProjectShape) {
				const url = curl<ProjectURL>(createProjectShape(project))
				homeList.addItem("project", url)
				return url
			},
			importProject(string: string) {
				const json = decodeJSON(string)
				if (isProjectRef(json)) {
					homeList.addItem("project", json.url)
				} else {
					toast.show({
						title: "Invalid project",
						body: "maybe ask your friend to send it again??",
						modifiers: ["error"],
					})
				}
			},
			adoptActionFromInbox(ref: ActionRef) {
				if (inboxList.hasItemByRef(ref)) {
					inboxList.removeItemByRef(ref)
				}
				if (!homeList.hasItemByRef(ref)) {
					homeList.addItemByRef(ref, homeList.items.length)
				}
			},
			giveActionToInbox(ref: ActionRef) {
				if (homeList.hasItemByRef(ref)) {
					homeList.removeItemByRef(ref)
				}
				if (!inboxList.hasItemByRef(ref)) {
					inboxList.addItemByRef(ref, inboxList.items.length)
				}
			},
		})

	return vm
}

export interface Home {
	type: "home"
	url: HomeURL
	list: List<"home">
	inbox: List<"inbox">
	keyed: List<"home">["keyed"]
	flat: List<"home">["flat"]

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
