import "./grouped-project.css"
import {A} from "@solidjs/router"
import {createMemo, Show} from "solid-js"

import ActionList from "../actions/action-list.tsx"
import {ProgressPie} from "./project-item.tsx"
import flattenTree from "::core/util/flattenTree.ts"
import type {Project} from "::domain/useProject.ts"
import type {ActionURL} from "::shapes/action.ts"
import type {SelectionContext} from "::viewmodels/selection/useSelection.ts"
import type {ActionExpander} from "::viewmodels/selection/useExpander.ts"
import {isAction, type Action} from "::domain/useAction.ts"

export function GroupedProject(props: {
	project: Project
	selection: SelectionContext<ActionURL>
	expander: ActionExpander
	filter: (item: Action) => boolean
	toggleActionCompleted: (item: Action, force?: boolean) => void
	toggleActionCanceled: (item: Action, force?: boolean) => void
}) {
	const actions = createMemo(() =>
		flattenTree(props.project.items).filter(isAction)
	)

	return (
		<Show when={actions().filter(props.filter).length > 0}>
			<div class="grouped-project">
				<header class="grouped-project__header">
					<div class="grouped-project__progress">
						<ProgressPie progress={props.project.progress} />
					</div>
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
