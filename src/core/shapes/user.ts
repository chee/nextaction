import {isValidAutomergeUrl, type AutomergeUrl} from "@automerge/automerge-repo"
import {createHome, type HomeURL} from "./home.ts"
import {curl} from "../sync/automerge.ts"

export type UserURL = AutomergeUrl & {type: "user"}

export interface UserShape {
	type: "user"
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
		type: "user",
	}
}
export function createUser(user?: Partial<UserShape>): UserURL {
	return curl<UserURL>({
		type: "user",
		home: user?.home ?? createHome(),
	})
}

export function isUser(user: unknown): user is UserShape {
	return (user as UserShape).type === "user"
}

export type UserRef = {url: UserURL; type: "user"}
export function isUserRef(obj: unknown): obj is UserRef {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"url" in obj &&
		"type" in obj &&
		isUser(obj) &&
		isValidAutomergeUrl((obj as UserRef).url)
	)
}
