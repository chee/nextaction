import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {HomeURL} from "./home.ts"

export type UserURL = AutomergeUrl & {type: "user"}

export interface UserShape {
	name: string
	image?: Uint8Array
	home: HomeURL
}

export function createUserShape(
	user: Partial<UserShape> & {home: UserShape["home"]}
): UserShape {
	return {
		name: "",
		...user,
	}
}
