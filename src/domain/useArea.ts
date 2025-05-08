import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import type {AreaShape, AreaURL} from "::shapes/area.ts"
import type {Project as Project} from "./useProject.ts"
import {isAction, type Action} from "./useAction.ts"
import mix from "::core/util/mix.ts"
import {useTitleableMixin, type TitleableMixin} from "./mixins/titleable.ts"
import {useNotableMixin, type NotableMixin} from "./mixins/notable.ts"
import {useListMixin, type List} from "./mixins/list.ts"
import {dedent} from "@qnighy/dedent"
import type {Reference, ReferencePointer} from "::shapes/reference.ts"
import defaultRepo from "::core/sync/automerge.ts"
export function useArea(url: Accessor<AreaURL>, repo = defaultRepo): Area {
	const [area, handle] = useDocument<AreaShape>(url, {repo: repo})
	const titleable = useTitleableMixin(area, handle)
	const notable = useNotableMixin(area, handle)
	const list = useListMixin(url, "area")

	const vm = mix(titleable, notable, list, {
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
		get deleted() {
			return area()?.deleted ?? false
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

	return vm
}

export interface Area extends TitleableMixin, NotableMixin, List<"area"> {
	type: "area"
	icon: string
	url: AreaURL
	delete(): void
	deleted: boolean
	toString(): string
	asReference(): Reference<"area">
	asPointer(above?: boolean): ReferencePointer<"area">
}

export function isArea(area: unknown): area is Area {
	return (area as Area).type === "area"
}

export function isAreaChild(child: unknown): child is Project | Action {
	return isArea(child) || isAction(child)
}
