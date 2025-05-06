import type {ProjectURL} from "::domain/project.ts"
import type {SelectionContext} from "::infra/hooks/selection-context.ts"
import type {ProjectViewModel} from "::viewmodel/project.ts"
import {ProjectItem} from "::ui/components/projects/project-item.tsx"

export function TodayProjectItem(props: {
	selection: SelectionContext<ProjectURL>
	project: ProjectViewModel
	toggleCompleted: (force?: boolean) => void
	toggleCanceled: (force?: boolean) => void
}) {
	return (
		<ProjectItem
			{...props.project}
			toggleCanceled={props.toggleCanceled}
			toggleCompleted={props.toggleCompleted}
			selected={props.selection.isSelected(props.project.url as ProjectURL)}
			select={() => props.selection.select(props.project.url as ProjectURL)}
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
