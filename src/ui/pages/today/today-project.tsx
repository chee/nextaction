import {Show} from "solid-js"
import type {ActionURL} from "::shapes/action.ts"
import type {ProjectURL} from "::shapes/project.ts"
import {GroupedProject} from "::ui/components/projects/grouped-project.tsx"
import {TodayProjectItem} from "./today-project-item.tsx"
import type {Project} from "::domain/useProject.ts"
import type {SelectionContext} from "::viewmodels/selection/useSelection.ts"
import type {Action} from "::domain/useAction.ts"
import type {ActionExpander} from "::viewmodels/selection/useExpander.ts"

export function TodayProject(props: {
	project: Project
	selection: SelectionContext<ProjectURL | ActionURL>
	expander: ActionExpander
	filter: (item: Project | Action) => boolean
	toggleItemCompleted: (item: Project | Action, force?: boolean) => void
	toggleItemCanceled: (item: Project | Action, force?: boolean) => void
}) {
	return (
		<>
			<Show when={props.filter(props.project)}>
				<TodayProjectItem
					project={props.project}
					selection={props.selection as SelectionContext<ProjectURL>}
					toggleCompleted={() => props.toggleItemCompleted(props.project)}
					toggleCanceled={() => props.toggleItemCanceled(props.project)}
				/>
			</Show>
			<GroupedProject
				{...props}
				selection={props.selection as SelectionContext<ActionURL>}
				toggleActionCanceled={props.toggleItemCanceled}
				toggleActionCompleted={props.toggleItemCompleted}
			/>
		</>
	)
}
