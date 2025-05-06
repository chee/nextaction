import "./grouped-project.css"
import {A} from "@solidjs/router"
import {createMemo, Show} from "solid-js"

import {type ActionURL} from "::domain/action.ts"
import type {SelectionContext} from "::infra/hooks/selection-context.ts"
import {type ActionViewModel, isActionViewModel} from "::viewmodel/action.ts"
import type {Expander} from "::viewmodel/helpers/page.ts"
import type {ProjectViewModel} from "::viewmodel/project.ts"
import ActionList from "../actions/action-list.tsx"
import {useProjectProgress} from "./use-project-progress.ts"
import flattenTree from "::infra/lib/flattenTree.ts"

export function GroupedProject(props: {
	project: ProjectViewModel
	selection: SelectionContext<ActionURL>
	expander: Expander<ActionURL>
	filter: (item: ActionViewModel) => boolean
	toggleActionCompleted: (item: ActionViewModel, force?: boolean) => void
	toggleActionCanceled: (item: ActionViewModel, force?: boolean) => void
}) {
	const actions = createMemo(() =>
		flattenTree(props.project.items).filter(isActionViewModel)
	)

	const [progress] = useProjectProgress(() => props.project.url)

	return (
		<Show when={actions().filter(props.filter).length > 0}>
			<div class="grouped-project">
				<header class="grouped-project__header">
					<div class="grouped-project__progress">{progress()}%</div>
					<A
						class="grouped-project__title"
						href={`/projects/${props.project.url}`}>
						<span class="grouped-project__title-icon">
							{props.project.icon}
						</span>
						<h3 class="grouped-project__title-text">{props.project.title}</h3>
					</A>
				</header>

				<ActionList
					actions={actions().filter(props.filter)}
					selection={props.selection}
					isSelected={props.selection.isSelected}
					{...props.expander}
					toggleCanceled={props.toggleActionCanceled}
					toggleCompleted={props.toggleActionCompleted}
					modifiers="grouped today"
				/>
			</div>
		</Show>
	)
}
