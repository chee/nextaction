import "./action-list.css"
import bemby, {type BembyModifiers} from "bemby"
import {Suspense} from "solid-js"
import {For} from "solid-js"
import Action from "@/ui/components/actions/action.tsx"
import type {SelectionContext} from "@/infra/hooks/selection-context.ts"
import {usePageContext} from "@/viewmodel/generic/page.ts"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import type {AnyDoableViewModel} from "../../../viewmodel/generic/doable.ts"

export default function DoableList(props: {
	modifiers?: BembyModifiers
	items: AnyDoableViewModel[]
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
					{realAction => {
						const isDragTarget = () =>
							props.selection.dragTarget() == realAction.url

						return (
							<Action
								droptarget={
									props.selection.dropTarget()?.url == realAction.url
										? props.selection.dropTarget()?.abovebelow
										: undefined
								}
								dragtarget={isDragTarget()}
								dragged={props.selection.dragged().includes(realAction.url)}
								ref={element => {
									page.createDraggable(element, realAction)
									page.createDropTarget(element, realAction)
								}}
								collapse={() => props.collapse(realAction.url)}
								expand={() => props.expand(realAction.url)}
								selected={props.isSelected(realAction.url)}
								expanded={props.isExpanded(realAction.url)}
								select={() => props.selection.select(realAction.url)}
								addSelected={() => props.selection.addSelected(realAction.url)}
								removeSelected={() =>
									props.selection.removeSelected(realAction.url)
								}
								addSelectedRange={() =>
									props.selection.addSelectedRange(realAction.url)
								}
								{...realAction}
								// todo probably a bad idea for this to know about the
								// page here?
								toggleCanceled={(force?: boolean) => {
									page.toggleItemCanceled(realAction, force)
								}}
								toggleCompleted={(force?: boolean) => {
									page.toggleItemComplete(realAction, force)
								}}
							/>
						)
					}}
				</For>
			</div>
		</Suspense>
	)
}
