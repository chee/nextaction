import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import type {Project, ProjectURL} from "../domain/project.ts"
import {useDoableMixin} from "./mixins/doable.ts"
import {isHeadingViewModel, type HeadingViewModel} from "./heading.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import {useListViewModel} from "./mixins/list.ts"
import type {HeadingRef, HeadingURL} from "@/domain/heading.ts"
import type {ActionRef, ActionURL} from "@/domain/action.ts"
import mix from "@/infra/lib/mix.ts"
import {useNotableMixin} from "./mixins/notable.ts"
import {useTitleableMixin} from "./mixins/titleable.ts"
import {dedent} from "@qnighy/dedent"
import repo from "../infra/sync/automerge-repo.ts"
import {
	addReference,
	indexOfReference,
	type Reference,
	type ReferencePointer,
} from "../domain/reference.ts"
import {addWithOptionsMethod} from "@solid-primitives/storage"

export function useProject(url: Accessor<ProjectURL>) {
	const [project, handle] = useDocument<Project>(url, {repo: repo})
	const notable = useNotableMixin(project, handle)
	const titleable = useTitleableMixin(project, handle)

	const doable = useDoableMixin(url)
	const list = useListViewModel<
		ActionViewModel | HeadingViewModel,
		ActionRef | HeadingRef
	>(url, "project")

	return mix(doable, list, notable, titleable, {
		type: "project" as const,
		get url() {
			return url()
		},
		get icon() {
			return project()?.icon ?? "🗂️"
		},
		delete() {
			handle()?.change(project => {
				project.deleted = true
			})
		},
		addItem(
			type: "heading" | "action",
			urls: typeof type extends "heading" ? HeadingURL[] : ActionURL[],
			index?: number | ReferencePointer<typeof type>
		) {
			if (type == "action") {
				const firstHeadingIndex = list.items.findIndex(r => r.type == "heading")
				let idx = 0
				if (typeof index == "number") {
					idx = index
				} else if (index) {
					idx =
						indexOfReference(project()!.items, {
							type: "action",
							url: index.url as ActionURL,
						}) + (index?.above ? 1 : 0)
				}
				idx = firstHeadingIndex == -1 ? idx : Math.min(idx, firstHeadingIndex)

				handle()?.change(doc => addReference(doc.items, type, urls, idx))
				return
			}
			handle()?.change(doc => addReference(doc.items, type, urls, index))
		},
		// todo move to domain
		set icon(icon: string) {
			const single = [...new Intl.Segmenter().segment(icon)]?.[0]?.segment
			handle()?.change(project => {
				project.icon = single ?? "🗂️"
			})
		},
		toString() {
			return dedent`\
				## ${project()?.icon} ${titleable.title}

				${notable.notes?.trim() ?? ""}

				${list.items.map(item => item.toString()).join("\n")}
			`.trim()
		},
		asReference(): Reference<"project"> {
			return {
				type: "project" as const,
				url: handle()?.url as ProjectURL,
			}
		},
		asPointer(above?: boolean): ReferencePointer<"project"> {
			return {
				type: "project" as const,
				url: handle()?.url as ProjectURL,
				above,
			}
		},
	})
}

export type ProjectViewModel = ReturnType<typeof useProject>

export function isProjectViewModel(
	project: unknown
): project is ProjectViewModel {
	return (project as ProjectViewModel).type === "project"
}

export function isProjectChildViewModel(
	child: unknown
): child is HeadingViewModel | ActionViewModel {
	return isHeadingViewModel(child) || isActionViewModel(child)
}
