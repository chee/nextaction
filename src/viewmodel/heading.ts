import type {Accessor} from "solid-js"
import {type ActionURL} from "@/domain/action.ts"
import {useDocument} from "solid-automerge"
import {useCodemirrorAutomerge} from "@/infra/editor/codemirror.ts"
import {
	toggleArchived,
	type Heading,
	type HeadingURL,
} from "@/domain/heading.ts"
import {isActionViewModel, type ActionViewModel} from "./action.ts"
import type {ProjectURL} from "../domain/project.ts"
import {refer} from "../domain/reference.ts"

export function useHeading(url: Accessor<HeadingURL>) {
	const [heading, handle] = useDocument<Heading>(url)
	const titleSyncExtension = useCodemirrorAutomerge(handle, ["title"])

	return {
		type: "heading" as const,
		get url() {
			return handle()?.url as ActionURL
		},
		get title() {
			return heading()?.title ?? ""
		},

		get titleSyncExtension() {
			return titleSyncExtension()
		},
		get archived() {
			return heading()?.archived ?? false
		},
		toggleArchived(force?: boolean) {
			handle()?.change(heading => {
				toggleArchived(heading, force)
			})
		},
		get parentURL() {
			return heading()?.parent
		},
		// todo move to domain
		setParent(parent: ProjectURL) {
			handle()?.change(heading => {
				heading.parent = refer("project", parent)
			})
		},
		// todo use in dnd contract
		// get external(): {[Key in NativeMediaType]?: string} {
		// 	const done = action() && isDone(action()!)
		// 	return {
		// 		"text/plain": `- [${done ? "x" : " "}] ${this.title}`,
		// 		"text/html": `<input type='checkbox' ${done ? "checked" : ""} value="${
		// 			this.title
		// 		}" />`,
		// 	}
		// },
	}
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
