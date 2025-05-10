import type {ActionURL} from "::shapes/action.ts"
import ActionItem from "../../components/actions/action.tsx"
import type {SelectionContext} from "::viewmodels/selection/useSelection.ts"
import type {Action} from "::domain/useAction.ts"
import type {ActionExpander} from "::viewmodels/selection/useExpander.ts"

// todo make this the standard action interface?
export function TodayAction(props: {
	selection: SelectionContext<ActionURL>
	action: Action
	expander: ActionExpander
	toggleCompleted: (force?: boolean) => void
	toggleCanceled: (force?: boolean) => void
}) {
	return (
		<ActionItem
			{...props.action}
			toggleCanceled={props.toggleCanceled}
			toggleCompleted={props.toggleCompleted}
			expanded={props.expander.isExpanded(props.action.url as ActionURL)}
			selected={props.selection.isSelected(props.action.url as ActionURL)}
			select={() => props.selection.select(props.action.url as ActionURL)}
			expand={() => props.expander.expand(props.action.url as ActionURL)}
			collapse={props.expander.collapse}
			addSelected={() => {
				props.selection.addSelected(props.action.url)
			}}
			removeSelected={() => {
				props.selection.removeSelected(props.action.url)
			}}
			addSelectedRange={() => {
				props.selection.addSelectedRange(props.action.url)
			}}
		/>
	)
}
