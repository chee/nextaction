import {Suspense} from "solid-js"
import type {ActionURL} from "::domain/action.ts"
import type {SelectionContext} from "::infra/hooks/selection-context.ts"
import type {ActionViewModel} from "::viewmodel/action.ts"
import type {Expander} from "::viewmodel/helpers/page.ts"
import Action from "::ui/components/actions/action.tsx"

// todo make this the standard action interface?
export function TodayAction(props: {
	selection: SelectionContext<ActionURL>
	action: ActionViewModel
	expander: Expander<ActionURL>
	toggleCompleted: (force?: boolean) => void
	toggleCanceled: (force?: boolean) => void
}) {
	return (
		<Suspense>
			<Action
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
