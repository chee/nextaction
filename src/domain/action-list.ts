import {isActionRef, type ActionRef} from "./action.ts"
import {add, move, moveAfter, remove} from "./list.ts"

export const addAction = add("actions")
export const removeAction = remove("actions")
export const moveAction = move("actions")
export const moveActionBefore = moveAfter("actions", 0)
export const moveActionAfter = moveAfter("actions", +1)

export type ActionList = {
	items: ActionRef[]
}

export function isActionList(actionList: unknown): actionList is ActionList {
	return (
		typeof actionList === "object" &&
		actionList !== null &&
		"items" in actionList &&
		Array.isArray((actionList as ActionList).items) &&
		(actionList as ActionList).items.every(isActionRef)
	)
}
