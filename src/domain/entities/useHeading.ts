import type {Accessor} from "solid-js"
import {useDocument} from "solid-automerge"
import {
	toggleArchived,
	type HeadingShape,
	type HeadingURL,
} from "::shapes/heading.ts"
import {isAction, type Action} from "./useAction.ts"
import {useTitleableMixin, type TitleableMixin} from "../mixins/titleable.ts"
import mix from "::core/util/mix.ts"
import {useListMixin, type List} from "../mixins/list.ts"
import type {Reference, ReferencePointer} from "::shapes/reference.ts"
import defaultRepo from "::core/sync/automerge.ts"

export function useHeading(
	url: Accessor<HeadingURL>,
	repo = defaultRepo
): Heading {
	const [heading, handle] = useDocument<HeadingShape>(url, {repo: repo})
	const titleable = useTitleableMixin(heading, handle)
	const list = useListMixin(url, "heading")

	const vm = mix(titleable, list, {
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

	return vm
}

export interface Heading extends List<"heading">, TitleableMixin {
	readonly type: "heading"
	readonly url: HeadingURL
	readonly archived: boolean
	toggleArchived(force?: boolean): void
	toString(): string
	asReference(): Reference<"heading">
	asPointer(above?: boolean): ReferencePointer<"heading">
	delete(): void
}
export function isHeading(heading: unknown): heading is Heading {
	return (heading as Heading).type === "heading"
}

export function isHeadingChild(child: unknown): child is Action {
	return isAction(child)
}
