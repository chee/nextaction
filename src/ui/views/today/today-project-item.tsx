import {ProjectItem} from "::ui/components/projects/project-item.tsx"
import type {Selection} from "::domain/state/useSelection.ts"
import type {ProjectURL} from "::shapes/project.ts"
import type {ActionURL} from "::shapes/action.ts"
import type {Project} from "::domain/entities/useProject.ts"

export function TodayProjectItem(props: {
	selection: Selection<ActionURL | ProjectURL>
	project: Project
	toggleCompleted: (force?: boolean) => void
	toggleCanceled: (force?: boolean) => void
}) {
	return (
		<ProjectItem
			{...props.project}
			toggleCanceled={props.toggleCanceled}
			toggleCompleted={props.toggleCompleted}
			selected={props.selection.isSelected(props.project.url)}
			select={() => props.selection.select(props.project.url)}
			addSelected={() => {
				props.selection.addSelected(props.project.url)
			}}
			removeSelected={() => {
				props.selection.removeSelected(props.project.url)
			}}
			addSelectedRange={() => {
				props.selection.addSelectedRange(props.project.url)
			}}
		/>
	)
}
