import "./action-list.css"
import bemby, {type BembyModifier, type BembyModifiers} from "bemby"
import {Suspense} from "solid-js"
import {For} from "solid-js"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import Action from "@/ui/components/actions/action.tsx"
import type {SelectionContext} from "@/infra/hooks/selection-context.ts"
import {createEffect} from "solid-js"

export default function ActionList(props: {
	modifiers?: BembyModifier | BembyModifiers
	actions: ActionViewModel[]
	selection: SelectionContext
	isSelected(url: string): boolean
	isExpanded(url: string): boolean
	expand(url: string): void
	collapse(url: string): void
	toggleCanceled(url: ActionViewModel, force?: boolean): void
	toggleCompleted(url: ActionViewModel, force?: boolean): void
}) {
	return (
		<div class={bemby("action-list", props.modifiers)} role="list">
			<For each={props.actions}>
				{action => (
					<Suspense>
						<Action
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
							// todo probably a bad idea for this to know about the
							// page here? this should be a prop
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
