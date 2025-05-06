import {useDocument} from "solid-automerge"
import {newUser, type User, type UserURL} from "@/domain/user.ts"
import {useUserId} from "@/infra/storage/user-id.ts"
import {type HomeURL, newHome} from "@/domain/home.ts"
import repo, {curl} from "@/infra/sync/automerge-repo.ts"
import {newInbox} from "@/domain/inbox.ts"
import {useHome} from "@/viewmodel/home.ts"
import {createContext} from "solid-js"

export function useUser() {
	const [userId] = useUserId()
	const [user, handle] = useDocument<User>(userId, {repo})
	return {
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

export type UserViewModel = ReturnType<typeof useUser>

export function createFirstTimeUser(name: string) {
	const [_, setUserId] = useUserId()
	const url = curl<UserURL>(
		newUser({
			name,
			home: curl<HomeURL>(
				newHome({
					inbox: curl(newInbox()),
				})
			),
		})
	)
	setUserId(url)
}

export const UserContext = createContext<UserViewModel>()
export const useUserContext = () => {
	const context = UserContext
	if (!context) {
		throw new Error("useUserContext must be used within a UserProvider")
	}
	return context
}
