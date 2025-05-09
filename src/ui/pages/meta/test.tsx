import {createAsync, useLocation} from "@solidjs/router"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import "::domain/entities/useHome.ts"
import {RepoContext} from "solid-automerge"
import {For} from "solid-js"
import {Suspense} from "solid-js"
import {useHome} from "::domain/entities/useHome.ts"
import defaultRepo from "::core/sync/automerge.ts"

export default function Test() {
	const location = useLocation()

	const _doc = createAsync(() =>
		defaultRepo
			.find(location.query.url as AutomergeUrl)
			.then(handle => handle.doc())
	)

	return (
		<RepoContext.Provider value={defaultRepo}>
			<Component />
			{/* <div class="test page-container"> */}
			{/* <pre>{JSON.stringify(doc(), null, 2)}</pre> */}
			{/* </div> */}
		</RepoContext.Provider>
	)
}

function Component() {
	const home = useHome()

	return (
		<pre>
			<For each={home.list.items}>
				{item => <Suspense>{(item.toString() ?? "").trim() + "\n"}</Suspense>}
			</For>
			{/* <Child items={items()} /> */}
		</pre>
	)
}
