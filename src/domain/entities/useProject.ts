import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import type {ProjectShape, ProjectURL} from "::shapes/project.ts"
import {useDoableMixin, type Doable} from "../mixins/doable.ts"
import {isHeading, type Heading} from "./useHeading.ts"
import {isAction as isAction, type Action} from "./useAction.ts"
import {useListMixin, type List} from "../mixins/list.ts"
import {useNotableMixin, type NotableMixin} from "../mixins/notable.ts"
import mix from "::core/util/mix.ts"
import {useTitleableMixin, type TitleableMixin} from "../mixins/titleable.ts"
import {dedent} from "@qnighy/dedent"
import {type Reference, type ReferencePointer} from "::shapes/reference.ts"
import defaultRepo from "::core/sync/automerge.ts"
import {createMemo} from "solid-js"
import {isClosed} from "::shapes/mixins/doable.ts"

export function useProject(
	url: Accessor<ProjectURL>,
	repo = defaultRepo
): Project {
	const [project, handle] = useDocument<ProjectShape>(url, {repo: repo})

	const notable = useNotableMixin(project, handle)
	const titleable = useTitleableMixin(project, handle)

	const doable = useDoableMixin(url)
	const list = useListMixin(url, "project")

	const actions = createMemo(
		() => list.flat.filter(item => isAction(item) && !item.deleted) as Action[]
	)

	const progress = calculateProgress(actions)

	const vm = mix(doable, list, notable, titleable, {
		type: "project" as const,
		get url() {
			return url()
		},
		get icon() {
			return project()?.icon ?? ""
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
				project.icon = single ?? " "
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
		get progress() {
			return progress()
		},
	})

	return vm
}

function calculateProgress(actions: () => Action[]) {
	const total = createMemo(() => actions().length)
	const closed = createMemo(() => actions().filter(a => isClosed(a)).length)
	const progress = () =>
		total() > 0 ? Math.round((closed() / total()) * 100) : 0
	return progress
}

export interface Project
	extends List<"project">,
		Doable,
		NotableMixin,
		TitleableMixin {
	readonly type: "project"
	icon: string
	readonly url: ProjectURL
	delete(): void
	toString(): string
	asReference(): Reference<"project">
	asPointer(above?: boolean): ReferencePointer<"project">
	progress: number
}

export function isProject(project: unknown): project is Project {
	return (project as Project).type === "project"
}

export function isProjectChild(child: unknown): child is Heading | Action {
	return isHeading(child) || isAction(child)
}
