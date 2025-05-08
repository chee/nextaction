import "./action-list.css"
import bemby, {type BembyModifier, type BembyModifiers} from "bemby"
import {Suspense} from "solid-js"
import {For} from "solid-js"
import ActionItem from "::ui/components/actions/action.tsx"
import type {Action} from "::domain/useAction.ts"
import type {SelectionContext} from "::viewmodels/selection/useSelection.ts"

export default function ActionList(props: {
	modifiers?: BembyModifier | BembyModifiers
	actions: Action[]
	selection: SelectionContext
	isSelected(url: string): boolean
	isExpanded(url: string): boolean
	expand(url: string): void
	collapse(url: string): void
	toggleCanceled(url: Action, force?: boolean): void
	toggleCompleted(url: Action, force?: boolean): void
}) {
	return (
		<div class={bemby("action-list", props.modifiers)} role="list">
			<For each={props.actions}>
				{action => (
					<Suspense>
						<ActionItem
							collapse={() => props.collapse(action.url)}
							expand={() => props.expand(action.url)}
							selected={props.isSelected(action.url)}
							expanded={props.isExpanded(action.url)}
							select={() => props.selection.select(action.url)}
							addSelected={() => props.selection.addSelected(action.url)}
							removeSelected={() => props.selection.removeSelected(action.url)}
							addSelectedRange={() =>
								props.selection.addSelectedRange(action.url)
							}
							{...action}
							class={bemby("action-item")}
							toggleCanceled={(force?: boolean) =>
								props.toggleCanceled(action, force)
							}
							toggleCompleted={(force?: boolean) =>
								props.toggleCompleted(action, force)
							}
						/>
					</Suspense>
				)}
			</For>
		</div>
	)
}
