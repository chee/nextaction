import "./action-list.css"
import bemby, {type BembyModifiers} from "bemby"
import {Suspense} from "solid-js"
import {For} from "solid-js"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import Action from "@/ui/components/actions/action.tsx"
import type {SelectionContext} from "@/infra/hooks/selection-context.ts"
import {usePageContext} from "../../../viewmodel/generic/page.ts"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

export default function ActionList(props: {
	modifiers?: BembyModifiers
	actions: ActionViewModel[]
	selection: SelectionContext
	isSelected(url: string): boolean
	isExpanded(url: string): boolean
	expand(url: string): void
	collapse(url: string): void
}) {
	const page = usePageContext()

	return (
		<Suspense>
			<div
				class={bemby("action-list", props.modifiers)}
				role="list"
				ref={element => {
					dropTargetForElements({
						element,
						onDragLeave() {
							props.selection.setDropTarget(undefined)
						},
					})
				}}>
				<For each={props.actions}>
					{action => {
						const isDragTarget = () =>
							props.selection.dragTarget() == action.url

						return (
							<Action
								droptarget={
									props.selection.dropTarget()?.url == action.url
										? props.selection.dropTarget()?.abovebelow
										: undefined
								}
								dragtarget={isDragTarget()}
								dragged={props.selection.dragged().includes(action.url)}
								ref={element => {
									page.createDraggable(element, action)
									page.createDropTarget(element, action)
								}}
								collapse={() => props.collapse(action.url)}
								expand={() => props.expand(action.url)}
								selected={props.isSelected(action.url)}
								expanded={props.isExpanded(action.url)}
								select={() => props.selection.select(action.url)}
								addSelected={() => props.selection.addSelected(action.url)}
								removeSelected={() =>
									props.selection.removeSelected(action.url)
								}
								addSelectedRange={() =>
									props.selection.addSelectedRange(action.url)
								}
								{...action}
							/>
						)
					}}
				</For>
			</div>
		</Suspense>
	)
}
