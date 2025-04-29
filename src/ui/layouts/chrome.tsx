import "./chrome.css"

import Bar from "@/ui/components/bar/bar.tsx"
import Sidebar from "@/ui/components/sidebar/sidebar.tsx"
import {createSignal, type JSX} from "solid-js"
import Resizable from "@corvu/resizable"
import {makePersisted} from "@solid-primitives/storage"

// todo a global handler for drops
// drop targets should set drop data that has methods:
//   - accepts(item: {type: string}): boolean
//   - drop(item): void
// onDrop we do location.current.dropTargets[0].drop(source.data.item)
// and this can all be done from monitorElements
// and similar for monitorExternal
// define drop action and droptarget actions right on the element,
// and separate that from the drop logic

export default function Chrome(props: {children?: JSX.Element}) {
	const [sizes, setSizes] = makePersisted(createSignal<number[]>([]), {
		name: "taskplace:chrome-sizes",
	})

	return (
		<Resizable class="chrome" sizes={sizes()} onSizesChange={setSizes}>
			<Resizable.Panel
				class="chrome__sidebar"
				as="aside"
				minSize={0.2}
				collapsible>
				<Sidebar />
			</Resizable.Panel>
			<Resizable.Handle class="chrome__handle" />
			<Resizable.Panel class="chrome__main">
				<div class="chrome__main">
					<Bar />
					<main class="chrome__content">{props.children}</main>
				</div>
			</Resizable.Panel>
		</Resizable>
	)
}
