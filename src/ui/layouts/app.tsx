import "./app.css"
import type {JSX} from "solid-js"
import {RepoContext} from "solid-automerge"
import {createEffect} from "solid-js"
import {useNavigate} from "@solidjs/router"

import {ToastRegion} from "::ui/components/base/toast.tsx"
import ServiceWorker from "::ui/components/base/service-worker.tsx"
import type {Repo} from "@automerge/automerge-repo/slim"
import defaultRepo from "::core/sync/automerge.ts"
import {useUserId} from "::domain/identity/user-id.ts"

export default function Chrome(props: {children?: JSX.Element; repo?: Repo}) {
	const nav = useNavigate()
	const [userId] = useUserId()
	createEffect(() => {
		if (!userId()) nav("/")
	})
	return (
		<RepoContext.Provider value={props.repo ?? defaultRepo}>
			{props.children}
			<ToastRegion />
			<ServiceWorker />
		</RepoContext.Provider>
	)
}
