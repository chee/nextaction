import {useDocument} from "solid-automerge"
import {useUser} from "./user.ts"
import type {Home, HomeURL} from "@/domain/home.ts"
import {mapArray} from "solid-js"
import {isAction, type Action, type ActionURL} from "@/domain/action.ts"
import {
	isProject,
	newProject,
	type Project,
	type ProjectURL,
} from "@/domain/project.ts"
import {isArea, newArea, type AreaURL} from "@/domain/area.ts"
import {useViewModel} from "@/viewmodel/generic/useviewmodel.ts"
import {useInbox} from "@/viewmodel/inbox.ts"
import {isAnytime, isSomeday, isToday} from "../domain/generic/doable.ts"
import {useListViewModel} from "./generic/list.ts"
import {curl} from "../infra/sync/automerge-repo.ts"
import {
	isProjectChildViewModel,
	isProjectViewModel,
	type ProjectViewModel,
} from "./project.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import {isAreaChildViewModel, type AreaViewModel} from "./area.ts"
import type {AnyDoableViewModel} from "./generic/doable.ts"
import type {DocHandle} from "@automerge/automerge-repo"
import {isHeading, type HeadingURL} from "../domain/heading.ts"
import type {HeadingViewModel} from "./heading.ts"

declare global {
	interface Window {
		home(): DocHandle<Home> | undefined
	}
}

export function useHome() {
	const user = useUser()
	const [home, handle] = useDocument<Home>(() => user.homeURL)
	self.home = handle
	const itemURLs = mapArray(
		() => home()?.items,
		ref => ref.url
	)
	const items = mapArray(
		() => home()?.items,
		url => useViewModel(() => url)
	)

	const list = useListViewModel(() => user.homeURL)

	const inbox = useInbox(() => home()?.inbox)

	return {
		type: "home",
		list,
		get items() {
			return items()
		},
		get itemURLs() {
			return itemURLs()
		},
		get today() {
			return this.items.filter(isToday)
		},
		get anytime() {
			return this.items.filter(isAnytime)
		},
		get someday() {
			return this.items.filter(isSomeday)
		},
		get actions() {
			return this.items.filter(isAction) as ActionViewModel[]
		},
		get projects() {
			return this.items.filter(isProject) as ProjectViewModel[]
		},
		get areas() {
			return this.items.filter(isArea) as AreaViewModel[]
		},
		get doables() {
			return this.items.filter(
				item => isProject(item) || isAction(item)
			) as AnyDoableViewModel[]
		},
		get projectsAndAreas() {
			return this.items.filter(item => isProject(item) || isArea(item)) as (
				| ProjectViewModel
				| AreaViewModel
			)[]
		},
		get areaChildren() {
			return this.items.filter(isAreaChildViewModel) as (
				| ActionViewModel
				| ProjectViewModel
			)[]
		},
		get projectChildren() {
			return this.items.filter(isProjectChildViewModel) as (
				| ActionViewModel
				| HeadingViewModel
			)[]
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
		forArea(url: AreaURL) {
			return this.items.filter(
				item => isAreaChildViewModel(item) && item.parentURL == url
			)
		},
		forProject(url: ProjectURL) {
			return this.projectChildren.filter(item => item.parentURL == url)
		},
		forHeading(url: HeadingURL) {
			return this.actions.filter(item => item.parentURL == url)
		},
		adoptActionFromInbox(url: ActionURL) {
			if (inbox.actionURLs.includes(url)) {
				inbox.removeAction(url)
				list.addItem("action", url)
			}
		},
		giveActionToInbox(url: ActionURL) {
			list.removeItem("action", url)
			inbox.addAction(url)
		},
		removeAction(url: ActionURL) {
			list.removeItem("action", url)
		},
		newProject() {
			const project = newProject()
			const url = curl(project)
			list.addItem("project", url as ProjectURL)
			return url
		},
		newArea() {
			const area = newArea()
			const url = curl(area)
			list.addItem("area", url as AreaURL)
			return url
		},
	}
}
