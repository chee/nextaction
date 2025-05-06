import {useDocument} from "solid-automerge"
import {UserContext, useUser} from "./user.ts"
import type {Home, HomeURL} from "@/domain/home.ts"
import {type ActionRef} from "@/domain/action.ts"
import {
	isProjectRef,
	newProject,
	ProjectURL,
	type Project,
} from "@/domain/project.ts"
import {useListViewModel} from "./mixins/list.ts"
import type {DocHandle} from "@automerge/automerge-repo"
import {decodeJSON} from "../infra/lib/compress.ts"
import repo, {curl} from "@/infra/sync/automerge-repo.ts"
import {toast} from "@/ui/components/base/toast.tsx"
import mix from "../infra/lib/mix.ts"
import {useContext} from "solid-js"

declare global {
	interface Window {
		home(): DocHandle<Home> | undefined
	}
}
export function useHome() {
	const user = useUser()

	const [home, handle] = useDocument<Home>(() => user.homeURL, {repo})
	self.home = handle

	const list = useListViewModel(() => user.homeURL, "home")

	const inbox = useListViewModel(() => home()?.inbox, "inbox")

	const vm = mix({
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
		get dropboxes() {
			return home()?.dropboxes ?? []
		},
		get inbox() {
			return inbox
		},
		createProject(project?: Project) {
			const url = curl<ProjectURL>(newProject(project))
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

	return vm
}

export type HomeViewModel = ReturnType<typeof useHome>
export type InboxViewModel = HomeViewModel["inbox"]

export function useHomeContext() {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error("useHomeContext must be used within a UserContext.Provider")
	}
	return context.home
}
