import {getParentURL} from "::infra/parent-registry.ts"
import {getType} from "::infra/type-registry.ts"
import {useViewModel} from "./useviewmodel.ts"
import {useHomeContext} from "./home.ts"
import type {
	AnyChildType,
	ChildConceptParentMap,
	ConceptURLMap,
} from "../concepts.ts"
import type {ActionRef} from "../domain/action.ts"
import type {AreaRef, AreaURL} from "../domain/area.ts"
export function useMovements() {
	const home = useHomeContext()
	return {
		reparent<T extends AnyChildType, U extends ConceptURLMap[T]>(
			itemURL: U,
			targetParentURL: ConceptURLMap[ChildConceptParentMap[T][number]]
		) {
			const itemType = getType(itemURL) as unknown as T
			const oldParentURL = getParentURL(itemURL)
			const itemViewModel = useViewModel(() => ({
				type: itemType,
				url: itemURL,
			}))
			const oldParentType = getType(oldParentURL)
			if (oldParentType == "home") {
				home.list.removeItemByRef(itemViewModel.asReference())
			} else if (oldParentType == "inbox") {
				home.inbox.removeItemByRef(itemViewModel.asReference() as ActionRef)
			} else {
				const oldParentURL = getParentURL(itemURL) as AreaURL
				const oldParentType = getType(oldParentURL) as "area"
				const oldParentViewModel = useViewModel(() => ({
					type: oldParentType,
					url: oldParentURL,
				}))
				oldParentViewModel.removeItemByRef(
					itemViewModel.asReference() as ActionRef
				)
			}
			const targetParentType = getType(targetParentURL)
			if (targetParentType == "home") {
				home.list.addItemByRef(itemViewModel.asReference())
				return
			} else if (targetParentType == "inbox") {
				home.inbox.addItemByRef(itemViewModel.asReference() as ActionRef)
				return
			}
			const newParentViewModel = useViewModel({
				type: targetParentType,
				url: targetParentURL,
			} as AreaRef)
			newParentViewModel.addItemByRef(itemViewModel.asReference() as ActionRef)
		},
	}
}
