import "./chrome.css"

import Sidebar from "@/ui/components/sidebar/sidebar.tsx"
import {createSignal, type JSX, Show} from "solid-js"
import Resizable, {ContextValue as ResizableContext} from "@corvu/resizable"
import {makePersisted} from "@solid-primitives/storage"
import {Button} from "@kobalte/core/button"
// todo move to a special media.ts
import {createMediaQuery} from "@solid-primitives/media"
import bemby from "bemby"
import {useIsRouting, useLocation} from "@solidjs/router"
import {createEffect} from "solid-js"

const isMobile = createMediaQuery("(max-width: 600px)")

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
	const [resizableContext, setResizableContext] =
		createSignal<ResizableContext>()
	const isCollapsed = () => resizableContext()?.sizes()[0] === 0

	const isRouting = useIsRouting()

	createEffect(() => {
		if (isMobile() && isRouting()) {
			resizableContext()?.collapse(0)
		}
	})

	return (
		<Resizable
			class={bemby("chrome", {
				mobile: isMobile(),
				"showing-sidebar": !isCollapsed(),
			})}
			sizes={sizes()}
			onSizesChange={setSizes}>
			{() => {
				setResizableContext(Resizable.useContext())
				return (
					<>
						<Resizable.Panel
							class="chrome__sidebar"
							as="aside"
							minSize={isMobile() ? 1 : 0.2}
							collapsible>
							<Show when={isMobile() && !isCollapsed()}>
								<Button
									title="hide sidebar"
									onClick={() => resizableContext()?.collapse(0)}
									class="button chrome__sidebar-control chrome__sidebar-control--collapse">
									<SidebarCollapsedIcon />
								</Button>
							</Show>
							<Sidebar />
						</Resizable.Panel>
						<Resizable.Handle class="chrome__handle" />
						<Resizable.Panel class="chrome__main">
							<div class="chrome__main">
								<Show when={isMobile() && isCollapsed()}>
									<Button
										title="show sidebar"
										onClick={() => resizableContext()?.expand(0)}
										class="button chrome__sidebar-control chrome__sidebar-control--expand">
										<SidebarExpandedIcon />
									</Button>
								</Show>
								<main class="chrome__content">{props.children}</main>
							</div>
						</Resizable.Panel>
					</>
				)
			}}
		</Resizable>
	)
}

function SidebarCollapsedIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			fill="currentColor"
			style={{height: "1rem", width: "1rem"}}>
			<path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36ZM44,60H76V196H44ZM212,196H100V60H212Z" />
		</svg>
	)
}

function SidebarExpandedIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
			fill="currentColor"
			style={{height: "1rem", width: "1rem"}}>
			<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H88V56H216V200Z" />
		</svg>
	)
}
