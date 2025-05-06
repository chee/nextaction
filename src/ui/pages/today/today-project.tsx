import {Show} from "solid-js"
import type {ActionURL} from "::domain/action.ts"
import type {ProjectURL} from "::domain/project.ts"
import type {SelectionContext} from "::infra/hooks/selection-context.ts"
import type {ActionViewModel} from "::viewmodel/action.ts"
import type {Expander} from "::viewmodel/helpers/page.ts"
import type {ProjectViewModel} from "::viewmodel/project.ts"
import {GroupedProject} from "::ui/components/projects/grouped-project.tsx"
import {TodayProjectItem} from "./today-project-item.tsx"

export function TodayProject(props: {
	project: ProjectViewModel
	selection: SelectionContext<ProjectURL | ActionURL>
	expander: Expander<ActionURL>
	filter: (item: ProjectViewModel | ActionViewModel) => boolean
	toggleItemCompleted: (
		item: ProjectViewModel | ActionViewModel,
		force?: boolean
	) => void
	toggleItemCanceled: (
		item: ProjectViewModel | ActionViewModel,
		force?: boolean
	) => void
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
