import {useDocument} from "solid-automerge"
import {useUser} from "./user.ts"
import type {Home, HomeURL} from "@/domain/home.ts"
import {mapArray} from "solid-js"
import {isAction, type ActionURL} from "@/domain/action.ts"
import {isProject} from "@/domain/project.ts"
import {isArea} from "@/domain/area.ts"
import {useViewModel} from "@/viewmodel/generic/useviewmodel.ts"
import {useInbox} from "@/viewmodel/inbox.ts"
import {isSomeday, isToday} from "@/domain/doable.ts"
import {useListViewModel} from "./generic/list.ts"
import type {AnyRef} from "../domain/reference.ts"

export function useHome() {
	const user = useUser()
	const [home, handle] = useDocument<Home>(() => user.homeURL)
	const itemURLs = mapArray(
		() => home()?.items,
		ref => ref.url
	)
	const items = mapArray(
		() => home()?.items,
		url => useViewModel(() => url)
	)

	const list = useListViewModel<AnyRef>(() => user.homeURL)

	const inbox = useInbox(() => home()?.inbox)

	return {
		type: "home",
		list,
		get items() {
			return items()
		},
		get today() {
			return items()?.filter(isToday)
		},
		get someday() {
			return items()?.filter(isSomeday)
		},
		get actions() {
			return items()?.filter(isAction) ?? []
		},
		get projects() {
			return items()?.filter(isProject) ?? []
		},
		get areas() {
			return items()?.filter(isArea) ?? []
		},
		get projectsAndAreas() {
			return (
				items()?.filter(
					item => item.type == "project" || item.type == "area"
				) ?? []
			)
		},
		get itemURLs() {
			return itemURLs()
		},
		get url() {
			return handle()?.url as HomeURL
		},
		get dropboxes() {
			return home()?.dropboxes ?? []
		},
		get inboxURL() {
			return home()?.inbox
		},
		get inbox() {
			return inbox
		},

		adoptActionFromInbox(url: ActionURL) {
			inbox.removeAction(url)
			list.addItem("action", url)
		},
		giveActionToInbox(url: ActionURL) {
			list.removeItem("action", url)
			inbox.addAction(url)
		},
		removeAction(url: ActionURL) {
			list.removeItem("action", url)
		},
	}
}

export type HomeViewModel = ReturnType<typeof useHome>
