import "./app.css"
import type {JSX} from "solid-js"
import {RepoContext} from "solid-automerge"
import {createEffect} from "solid-js"
import {useNavigate} from "@solidjs/router"

import {ToastRegion} from "@/ui/components/base/toast.tsx"
import ServiceWorker from "@/ui/components/base/service-worker.tsx"
import repo from "@/infra/sync/automerge-repo.ts"
import {useUserId} from "@/infra/storage/user-id.ts"

export default function Chrome(props: {children?: JSX.Element}) {
	const nav = useNavigate()
	const [userId] = useUserId()
	createEffect(() => {
		if (!userId()) nav("/")
	})
	return (
		// deno-lint-ignore no-explicit-any
		<RepoContext.Provider value={repo as any}>
			<div class="app">
				{props.children}
				<ToastRegion />
				<ServiceWorker />
			</div>
		</RepoContext.Provider>
	)
}
