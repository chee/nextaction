import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import type {Project, ProjectURL} from "::domain/project.ts"
import {useDoableMixin, type DoableViewModel} from "./mixins/doable.ts"
import {isHeadingViewModel, type HeadingViewModel} from "./heading.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import {useListViewModel, type ListViewModel} from "./mixins/list.ts"
import mix from "::infra/lib/mix.ts"
import {useNotableMixin, type NotableViewModel} from "./mixins/notable.ts"
import {useTitleableMixin, type TitleableViewModel} from "./mixins/titleable.ts"
import {dedent} from "@qnighy/dedent"
import repo from "::infra/sync/automerge-repo.ts"
import {type Reference, type ReferencePointer} from "::domain/reference.ts"

export function useProject(url: Accessor<ProjectURL>): ProjectViewModel {
	const [project, handle] = useDocument<Project>(url, {repo: repo})

	const notable = useNotableMixin(project, handle)
	const titleable = useTitleableMixin(project, handle)

	const doable = useDoableMixin(url)
	const list = useListViewModel(url, "project")

	const vm = mix(doable, list, notable, titleable, {
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

	return vm
}

export interface ProjectViewModel
	extends ListViewModel<"project">,
		DoableViewModel,
		NotableViewModel,
		TitleableViewModel {
	readonly type: "project"
	icon: string
	readonly url: ProjectURL
	delete(): void
	toString(): string
	asReference(): Reference<"project">
	asPointer(above?: boolean): ReferencePointer<"project">
}

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
