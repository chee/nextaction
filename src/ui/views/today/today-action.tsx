import {Suspense} from "solid-js"
import type {Action} from "::domain/entities/useAction.ts"
import type {Selection} from "::domain/state/useSelection.ts"
import type {ActionURL} from "::shapes/action.ts"
import type {Expander} from "::domain/state/useExpander.ts"
import ActionItem from "../../components/actions/action.tsx"

// todo make this the standard action interface?
export function TodayAction(props: {
	selection: Selection<ActionURL>
	action: Action
	expander: Expander<"action">
	toggleCompleted: (force?: boolean) => void
	toggleCanceled: (force?: boolean) => void
}) {
	return (
		<Suspense>
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
		</Suspense>
	)
}
