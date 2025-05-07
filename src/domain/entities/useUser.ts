import {useDocument} from "solid-automerge"
import {createUserShape, type UserShape, type UserURL} from "::shapes/user.ts"
import {type HomeURL, createHomeShape} from "::shapes/home.ts"
import {createInboxShape} from "::shapes/inbox.ts"
import {useHome, type Home as Home} from "./useHome.ts"
import {createContext} from "solid-js"
import defaultRepo from "::core/sync/automerge.ts"
import {useUserId} from "::domain/identity/user-id.ts"

export function useUser(repo = defaultRepo): User {
	const [userId] = useUserId()
	const [user, handle] = useDocument<UserShape>(userId, {repo})
	return {
		type: "user" as const,
		get url() {
			return userId()!
		},
		get home() {
			return useHome()
		},
		get homeURL() {
			return user()?.home
		},
		get image() {
			return user()?.image
		},
		set image(image: Uint8Array | undefined) {
			handle()?.change(user => {
				user.image = image
			})
		},
		get name() {
			return user()?.name ?? ""
		},
		set name(name: string) {
			handle()?.change(user => {
				user.name = name
			})
		},
	}
}

export interface User {
	readonly type: "user"
	readonly url: UserURL
	readonly homeURL?: HomeURL
	readonly home: Home
	image: Uint8Array | undefined
	name: string
}

export function createFirstTimeUser(name: string) {
	const [_, setUserId] = useUserId()
	const url = curl<UserURL>(
		createUserShape({
			name,
			home: curl<HomeURL>(
				createHomeShape({
					inbox: curl(createInboxShape()),
				})
			),
		})
	)
	setUserId(url)
}

export const UserContext = createContext<User>()
export const useUserContext = () => {
	const context = UserContext
	if (!context) {
		throw new Error("useUserContext must be used within a UserProvider")
	}
	return context
}
