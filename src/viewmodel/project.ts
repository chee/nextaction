import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {useCodemirrorAutomerge} from "@/infra/editor/codemirror.ts"
import type {Project, ProjectURL} from "../domain/project.ts"
import mergeDescriptors from "merge-descriptors"
import {useDoable} from "./generic/doable.ts"
import type {AreaURL} from "../domain/area.ts"
import {refer} from "../domain/reference.ts"
import {isHeadingViewModel, type HeadingViewModel} from "./heading.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"

export function useProject(url: Accessor<ProjectURL>) {
	const [project, handle] = useDocument<Project>(url)
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])
	const notesSyncExtension = useCodemirrorAutomerge(handle, ["notes"])

	const doable = useDoable(url)

	return mergeDescriptors(doable, {
		type: "project" as const,
		get url() {
			return url()
		},
		get icon() {
			return project()?.icon ?? "🗂️"
		},
		// todo move to domain
		set icon(icon: string) {
			const single = [...new Intl.Segmenter().segment(icon)]?.[0]?.segment
			handle()?.change(project => {
				project.icon = single ?? "🗂️"
			})
		},
		get title() {
			return project()?.title ?? ""
		},
		// todo move to a useNoteable
		get notes() {
			return project()?.notes ?? ""
		},
		get notesSyncExtension() {
			return notesSyncExtension()
		},
		get titleSyncExtension() {
			return titleSyncExtension()
		},
		get parentURL() {
			return project()?.parent
		},
		// todo move to domain
		setParent(parent: AreaURL) {
			handle()?.change(project => {
				project.parent = refer("area", parent)
			})
		},
		orphan() {
			handle()?.change(project => delete project.parent)
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
