import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {
	toggleArchived,
	type Heading,
	type HeadingURL,
} from "@/domain/heading.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import {useTitleableMixin} from "./mixins/titleable.ts"
import mix from "@/infra/lib/mix.ts"
import {useListViewModel} from "./mixins/list.ts"
import repo from "../infra/sync/automerge-repo.ts"
import type {Reference, ReferencePointer} from "../domain/reference.ts"

export function useHeading(url: Accessor<HeadingURL>) {
	const [heading, handle] = useDocument<Heading>(url, {repo: repo})
	const titleable = useTitleableMixin(heading, handle)
	const list = useListViewModel<ActionViewModel>(url, "heading")

	return mix(titleable, list, {
		type: "heading" as const,
		get url() {
			return handle()?.url as HeadingURL
		},
		get archived() {
			return heading()?.archived ?? false
		},
		toggleArchived(force?: boolean) {
			handle()?.change(heading => {
				toggleArchived(heading, force)
			})
		},
		toString() {
			return `### ${titleable.title}\n\n`
		},
		asReference(): Reference<"heading"> {
			return {
				type: "heading" as const,
				url: handle()?.url as HeadingURL,
			}
		},
		delete() {
			this.toggleArchived(true)
		},
		asPointer(above?: boolean): ReferencePointer<"heading"> {
			return {
				type: "heading" as const,
				url: handle()?.url as HeadingURL,
				above,
			}
		},
	})
}

export type HeadingViewModel = ReturnType<typeof useHeading>

export function isHeadingViewModel(
	heading: unknown
): heading is HeadingViewModel {
	return (heading as HeadingViewModel).type === "heading"
}

export function isHeadingChildViewModel(
	child: unknown
): child is ActionViewModel {
	return isActionViewModel(child)
}
