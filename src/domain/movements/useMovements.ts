import type {
	AnyChildType,
	ChildConceptParentMap,
	ConceptURLMap,
} from ":concepts:"
import type {ActionRef, ActionURL} from "::shapes/action.ts"
import type {AreaRef, AreaURL} from "::shapes/area.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {getType} from "::registries/type-registry.ts"
import {getParentURL} from "::registries/parent-registry.ts"
import {useModel} from "::domain/useModel.ts"
import {point, type ReferencePointer} from "::shapes/reference.ts"
import type {Area} from "../useArea.ts"
import {pushHistoryEntry} from "::viewmodels/commands/commands.tsx"

export function useMovements() {
	// todo this should be undoable
	const home = useHomeContext()

	return {
		// todo check constraints
		reparent<T extends AnyChildType, U extends ConceptURLMap[T]>(
			itemURL: U,
			targetParentURL: ConceptURLMap[ChildConceptParentMap[T][number]],

			index?: ReferencePointer<AnyChildType> | number
		) {
			const itemType = getType(itemURL) as unknown as T
			const oldParentURL = getParentURL(itemURL)
			const itemEntity = useModel(() => ({
				type: itemType,
				url: itemURL,
			}))
			const oldParentType = getType(oldParentURL)
			if (!oldParentURL) {
				// all good
			}
			let oldIndex = -1
			if (oldParentType == "home" && itemEntity.type != "heading") {
				oldIndex = home.list.itemURLs.indexOf(itemURL as ActionURL)
				home.list.removeItemByRef(itemEntity.asReference())
			} else if (oldParentType == "inbox") {
				oldIndex = home.inbox.itemURLs.indexOf(itemURL as ActionURL)
				home.inbox.removeItemByRef(itemEntity.asReference() as ActionRef)
			} else {
				const oldParentURL = getParentURL(itemURL) as AreaURL
				const oldParentType = getType(oldParentURL) as "area"
				const oldParentModel = useModel(() => ({
					type: oldParentType,
					url: oldParentURL,
				}))
				oldIndex = oldParentModel.itemURLs.indexOf(itemURL as ActionURL)
				oldParentModel.removeItemByRef(itemEntity.asReference() as ActionRef)
			}
			const targetParentType = getType(targetParentURL)
			if (targetParentType == "home" && itemEntity.type != "heading") {
				home.list.addItemByRef(
					itemEntity.asReference(),
					index as ReferencePointer<"action">
				)
				return
			} else if (targetParentType == "inbox") {
				home.inbox.addItemByRef(
					itemEntity.asReference() as ActionRef,
					index as ReferencePointer<"action">
				)
				return
			}
			const newParentEntity = useModel({
				type: targetParentType,
				url: targetParentURL,
			} as AreaRef) as Area
			newParentEntity.addItemByRef(
				itemEntity.asReference() as ActionRef,
				index as ReferencePointer<"action">
			)
			// deno-lint-ignore no-this-alias
			const movements = this

			pushHistoryEntry({
				undo() {
					movements.reparent(itemURL, oldParentURL, oldIndex)
				},
				redo() {
					movements.reparent(itemURL, targetParentURL, index)
				},
			})
		},
		drop<T extends AnyChildType, U extends ConceptURLMap[T]>(
			dragged: U[],
			dropTarget: ConceptURLMap[ChildConceptParentMap[T][number]],
			position: "on" | "above" | "below"
		) {
			// todo check constraints
			// todo be smarter
			for (const url of dragged) {
				if (position == "on") {
					this.reparent(url, dropTarget)
				} else {
					this.reparent(
						url,
						// @ts-expect-error todo
						getParentURL(dropTarget),
						point(
							getType(dropTarget),
							// @ts-expect-error todo
							dropTarget,
							position == "above"
						)
					)
				}
			}
		},
	}
}
