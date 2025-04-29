import { useDocument } from "solid-automerge"
import { useUser } from "./user.ts"
import type { Home, HomeURL } from "@/domain/home.ts"
import { useInbox } from "@/viewmodel/inbox.ts"

export function useHome() {
	const user = useUser()
	const [home, handle] = useDocument<Home>(() => user.homeURL)

	return {
		get url() {
			return handle()?.url as HomeURL
		},
		get dropboxes() {
			return home()?.dropboxes ?? []
		},
		get inboxURL() {
			return home()?.inbox
		},
		get inbox() {
			return useInbox()
		},
		get itemURLs() {
			return home()?.items ?? []
		},
		// todo get items() which returns a mapArray of (Project|Area)[]
	}
}

export type HomeViewModel = ReturnType<typeof useHome>
