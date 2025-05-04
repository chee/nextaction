import {createAsync, useLocation} from "@solidjs/router"
import repo from "@/infra/sync/automerge-repo.ts"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import "@/viewmodel/home.ts"
import {RepoContext} from "solid-automerge"
import {For} from "solid-js"
import type {AreaViewModel} from "@/viewmodel/area.ts"
import type {ActionViewModel} from "@/viewmodel/action.ts"
import type {ProjectViewModel} from "@/viewmodel/project.ts"
import type {HeadingViewModel} from "@/viewmodel/heading.ts"
import {useHome} from "../../../viewmodel/home.ts"
import {Suspense} from "solid-js"

export default function Test() {
	const location = useLocation()

	const doc = createAsync(() =>
		repo.find(location.query.url as AutomergeUrl).then(handle => handle.doc())
	)

	return (
		<RepoContext.Provider value={repo}>
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

function Child(props: {
	items: (
		| AreaViewModel
		| ActionViewModel
		| ProjectViewModel
		| HeadingViewModel
	)[]
}) {
	return (
		<div style={{"padding-left": "1em", "border-left": "2px solid cyan"}}>
			<For each={props.items}>
				{item => {
					const desc = (
						<div>
							{item.type} {item.title}
						</div>
					)
					if ("items" in item) {
						return (
							<>
								{desc}
								<Child items={item.items} />
							</>
						)
					}
					return <>{desc}</>
				}}
			</For>
		</div>
	)
}
