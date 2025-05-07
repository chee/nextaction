import {getParentURL} from "::domain/registries/parent-registry.ts"
import {getType} from "::domain/registries/type-registry.ts"
import {useEntity} from "../useDomainEntity.ts"
import type {
	AnyChildType,
	ChildConceptParentMap,
	ConceptURLMap,
} from ":concepts:"
import type {ActionRef} from "::shapes/action.ts"
import type {AreaRef, AreaURL} from "::shapes/area.ts"
import {useHomeContext} from "../entities/useHome.ts"
export function useMovements() {
	const home = useHomeContext()

	return {
		reparent<T extends AnyChildType, U extends ConceptURLMap[T]>(
			itemURL: U,
			targetParentURL: ConceptURLMap[ChildConceptParentMap[T][number]]
		) {
			const itemType = getType(itemURL) as unknown as T
			const oldParentURL = getParentURL(itemURL)
			const itemEntity = useEntity(() => ({
				type: itemType,
				url: itemURL,
			}))
			const oldParentType = getType(oldParentURL)
			if (oldParentType == "home" && itemEntity.type != "heading") {
				home.list.removeItemByRef(itemEntity.asReference())
			} else if (oldParentType == "inbox") {
				home.inbox.removeItemByRef(itemEntity.asReference() as ActionRef)
			} else {
				const oldParentURL = getParentURL(itemURL) as AreaURL
				const oldParentType = getType(oldParentURL) as "area"
				const oldParentEntity = useEntity(() => ({
					type: oldParentType,
					url: oldParentURL,
				}))
				oldParentEntity.removeItemByRef(itemEntity.asReference() as ActionRef)
			}
			const targetParentType = getType(targetParentURL)
			if (targetParentType == "home" && itemEntity.type != "heading") {
				home.list.addItemByRef(itemEntity.asReference())
				return
			} else if (targetParentType == "inbox") {
				home.inbox.addItemByRef(itemEntity.asReference() as ActionRef)
				return
			}
			const newParentEntity = useEntity({
				type: targetParentType,
				url: targetParentURL,
			} as AreaRef)
			newParentEntity.addItemByRef(itemEntity.asReference() as ActionRef)
		},
	}
}
