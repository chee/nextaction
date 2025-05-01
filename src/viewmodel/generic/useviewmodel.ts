import type {AnyRef} from "@/domain/reference.ts"
import {useAction} from "@/viewmodel/action.ts"
import type {ActionURL} from "@/domain/action.ts"

export function useViewModel(ref: () => AnyRef) {
	const r = ref()
	if (r.type === "action") {
		return useAction(() => r.url as ActionURL)
	}
	// if (ref.type === "project") {
	// return useProject(() => ref.ref)
	// }
	// if (ref.type === "area") {
	// return useArea(() => ref.ref)
	// }
	throw new Error("Invalid reference type")
}
