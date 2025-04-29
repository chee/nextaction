import type { ActionURL } from "./action.ts"
import { add, move, remove } from "./list.ts"

export const addAction = add("actions")
export const removeAction = remove("actions")
export const moveAction = move("actions")

export type ActionList = {
	actions: ActionURL[]
}

export function isActionList(actionList: unknown): actionList is ActionList {
	return (
		typeof actionList === "object" &&
		actionList !== null &&
		"actions" in actionList &&
		Array.isArray((actionList as ActionList).actions)
	)
}
