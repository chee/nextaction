import "./action-list.css"

import bemby, {type BembyModifiers} from "bemby"
import {Suspense, Show} from "solid-js"
import {For} from "solid-js"
import {useAction, type ActionViewModel} from "@/viewmodel/action.ts"
import Action from "@/ui/components/actions/action.tsx"
import type {ActionListViewModel} from "@/viewmodel/action-list.ts"
import type {ListContext} from "@/infra/hooks/list-context.ts"
import {draggable, droptarget} from "@/infra/dnd/directives.ts"
import type {ActionURL} from "@/domain/action.ts"
import {mapArray} from "solid-js"

export default function ActionList(
	props: {
		modifiers?: BembyModifiers
		actions: ActionViewModel[]
		list: ListContext
		isSelected(url: string): boolean
		isExpanded(url: string): boolean
		expand(url: string): void
		collapse(url: string): void
	} & ActionListViewModel
) {
	return (
		<Suspense>
			<div class={bemby("action-list", props.modifiers)} role="list">
				<For each={props.actions}>
					{(action, index) => {
						return (
							<Action
								dragged={props.list.dragged().includes(action.url)}
								// todo move all this drag code out somewhere
								ref={element => {
									draggable(
										element,
										{
											type: "action",
										},
										{
											onDragStart() {
												props.list.startDrag(action.url)
											},
											onDrop(args) {
												args.source.data.sources =
													props.list.completeDrag() as ActionURL[]

												console.log(props.list.displayed(), "dis")
												console.log(props.list.dragged(), "dra")
											},
										}
									)
									droptarget(element, {
										onDrop({
											location: {
												current: {
													dropTargets: [target],
												},
											},
											source,
										}) {
											if (source.data.type == "action")
												if (
													target?.data?.accepts?.includes(
														source.data.type
													)
												) {
													target.data.drop(
														source.data.type,
														source.data.sources
													)
												} else {
													console.log(
														"unacceptable drop",
														source.data,
														target?.data
													)
												}
										},

										getData() {
											return {
												accepts: ["action"],
												drop(type: "action", sources: ActionURL) {
													if (type !== "action") return
													props.moveAction(sources, index())
												},
											}
										},
									})
								}}
								collapse={() => {
									props.collapse(action.url)
								}}
								expand={() => props.expand(action.url)}
								selected={props.isSelected(action.url)}
								expanded={props.isExpanded(action.url)}
								select={() => props.list.select(action.url)}
								addSelected={() => props.list.add(action.url)}
								addSelectedRange={() => props.list.addRange(action.url)}
								move={(index: number) => {
									props.moveAction(action.url, index)
								}}
								{...action}
							/>
						)
					}}
				</For>
			</div>
		</Suspense>
	)
}
