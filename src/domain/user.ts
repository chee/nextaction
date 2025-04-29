import type {AutomergeUrl} from "@automerge/automerge-repo"
import type {HomeURL} from "./home.ts"

export type UserURL = AutomergeUrl & {type: "user"}

export interface User {
	name: string
	image?: Uint8Array
	home: HomeURL
}

export function newUser(user: Partial<User> & {home: User["home"]}): User {
	return {
		name: "",
		...user,
	}
}
