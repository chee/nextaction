import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import type {Area, AreaURL} from "@/domain/area.ts"
import type {ProjectViewModel} from "./project.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import mix from "../infra/lib/mix.ts"
import {useTitleableMixin} from "./mixins/titleable.ts"
import {useNotableMixin} from "./mixins/notable.ts"
import {useListViewModel} from "./mixins/list.ts"
import {dedent} from "@qnighy/dedent"
import repo from "../infra/sync/automerge-repo.ts"
import type {Reference, ReferencePointer} from "../domain/reference.ts"

export function useArea(url: Accessor<AreaURL>) {
	const [area, handle] = useDocument<Area>(url, {repo: repo})
	const titleable = useTitleableMixin(area, handle)
	const notable = useNotableMixin(area, handle)
	const list = useListViewModel<ActionViewModel | ProjectViewModel>(url, "area")
	return mix(titleable, notable, list, {
		type: "area" as const,
		get icon() {
			return area()?.icon ?? "🗃️"
		},
		get url() {
			return handle()?.url as AreaURL
		},
		get title() {
			return area()?.title ?? ""
		},
		set icon(icon: string) {
			const single = [...new Intl.Segmenter().segment(icon)]?.[0]?.segment
			handle()?.change(project => {
				project.icon = single ?? "🗂️"
			})
		},
		delete() {
			handle()?.change(area => {
				area.deleted = true
			})
		},
		toString() {
			return dedent`\
				# ${area()?.icon ?? ""} ${titleable.title}

				${notable.notes?.trim() ?? ""}

				${list.items.map(item => item.toString()).join("\n")}
			`
		},
		asReference(): Reference<"area"> {
			return {
				type: "area" as const,
				url: handle()?.url as AreaURL,
			}
		},
		asPointer(above?: boolean): ReferencePointer<"area"> {
			return {
				type: "area" as const,
				url: handle()?.url as AreaURL,
				above,
			}
		},
	})
}

export type AreaViewModel = ReturnType<typeof useArea>

export function isAreaViewModel(area: unknown): area is AreaViewModel {
	return (area as AreaViewModel).type === "area"
}

export function isAreaChildViewModel(
	child: unknown
): child is ProjectViewModel | ActionViewModel {
	return isAreaViewModel(child) || isActionViewModel(child)
}
