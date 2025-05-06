import {useDocument} from "solid-automerge"
import {UserContext, useUser} from "./user.ts"
import type {Home, HomeURL} from "@/domain/home.ts"
import {type ActionRef, type ActionURL} from "@/domain/action.ts"
import {
	isProjectRef,
	newProject,
	ProjectURL,
	type Project,
} from "@/domain/project.ts"
import {useListViewModel} from "./mixins/list.ts"
import type {AutomergeUrl, DocHandle} from "@automerge/automerge-repo"
import {decodeJSON} from "../infra/lib/compress.ts"
import repo, {curl} from "@/infra/sync/automerge-repo.ts"
import {type Reference} from "@/domain/reference.ts"
import {toast} from "@/ui/components/base/toast.tsx"
import mix from "../infra/lib/mix.ts"
import {createContext} from "solid-js"
import {useContext} from "solid-js"
import ViewModelCache from "./cache.ts"

declare global {
	interface Window {
		home(): DocHandle<Home> | undefined
	}
}

type MoveBetweenParentArgs = {
	sourceListURL: AutomergeUrl
	targetListURL: AutomergeUrl
	movingItemItem: string
	movingItemURL: AutomergeUrl
	pointerURL?: AutomergeUrl
	pointerType?: string
	above?: boolean
	index?: number
}

export async function moveBetweenParents({
	sourceListURL: sourceParentURL,
	targetListURL: targetParentURL,
	movingItemItem: itemType,
	movingItemURL: itemURL,
	pointerType,
	pointerURL,
	index,
	above: before,
}: MoveBetweenParentArgs) {
	if (pointerURL && pointerType && typeof index == "number") {
		throw new Error("Cannot specify both pointer and index")
	}
	if (typeof index == "number" && typeof before == "boolean") {
		throw new Error("Cannot specify both index and before")
	}
	if ((pointerURL && !pointerType) || (!pointerURL && pointerType)) {
		throw new Error("Pointer and type must be specified together")
	}
	const sameItem = itemURL == pointerURL
	if (sameItem) {
		return
	}
	const sameParent = sourceParentURL == targetParentURL

	const sourceParent = await repo.find<{items: Reference[]}>(sourceParentURL)
	const targetParent = sameParent
		? undefined
		: await repo.find<{items: Reference[]}>(targetParentURL)
	sourceParent.change(doc => {
		if (!doc.items) {
			console.error("No items in source parent", doc)
			return
		}
		const idx = doc.items.findIndex(item => item.url == itemURL)
		const item = doc.items[idx]

		if (idx > -1) {
			doc.items.splice(idx, 1)
		}
		if (sameParent) {
			if (pointerURL && pointerType) {
				index = doc.items.findIndex(item => item.url == pointerURL) ?? 0
				if (!before) {
					index += 1
				}
			} else if (typeof index != "number") {
				index = doc.items.length
			}
			doc.items.splice(index == -1 ? doc.items.length : index, 0, {...item})
		}
	})
	if (sameParent) return
	targetParent?.change(doc => {
		if (!doc.items) {
			console.error("No items in target parent", doc)
			return
		}
		if (pointerURL && pointerType) {
			index = doc.items.findIndex(item => item.url == pointerURL) ?? 0
			if (!before) {
				index += index + 1
			}
		} else if (typeof index != "number") {
			index = doc.items.length
		}
		doc.items.splice(index, 0, {
			type: itemType,
			url: itemURL,
		})
	})
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
