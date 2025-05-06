import "./chrome.css"

import Sidebar from "@/ui/components/sidebar/sidebar.tsx"
import {createSignal, type JSX, Show} from "solid-js"
import Resizable, {ContextValue as ResizableContext} from "@corvu/resizable"
import {makePersisted} from "@solid-primitives/storage"
import {Button} from "@kobalte/core/button"
// todo move to a special media.ts
import bemby from "bemby"
import {useIsRouting} from "@solidjs/router"
import {createEffect} from "solid-js"
import {onMount} from "solid-js"
import {UserContext, useUser} from "../../viewmodel/user.ts"
import {createMediaQuery} from "@solid-primitives/media"

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
	const user = useUser()
	const [sizes, setSizes] = makePersisted(createSignal<number[]>([0.2, 0.8]), {
		name: "taskplace:chrome-sizes",
	})
	const [preferredSidebarSize, setPreferredSidebarSize] = makePersisted(
		createSignal(0.2)
	)

	const [manuallyDragging, setManuallyResizing] = createSignal(false)

	const [resizableContext, setResizableContext] =
		createSignal<ResizableContext>()
	const sidebarIsCollapsed = () => resizableContext()?.sizes()[0] === 0

	const currentSidebarSize = () => {
		return resizableContext()?.sizes()[0]
	}

	// todo get remember sidebar size code from littlebook
	const expandSidebar = () => {
		const context = resizableContext()
		const preferred = preferredSidebarSize()
		context?.setSizes([preferred, context.sizes()[1]])
	}

	const collapseSidebar = () => {
		const context = resizableContext()
		setPreferredSidebarSize(currentSidebarSize() ?? 0.2)
		context?.setSizes([0, context.sizes()[1]])
	}

	const isRouting = useIsRouting()

	createEffect(() => {
		if (isMobile() && isRouting()) {
			resizableContext()?.collapse(0)
		}
	})

	const [firstLoad, setFirstLoad] = createSignal(true)

	onMount(() => {
		if (isMobile()) {
			resizableContext()?.collapse(0)
		} else {
			const preferred = preferredSidebarSize()
			resizableContext()?.setSizes([preferred, 1 - preferred])
		}
		setTimeout(() => {
			setFirstLoad(false)
		})
	})

	return (
		<UserContext.Provider value={user}>
			<Resizable
				class={bemby("chrome", {
					mobile: isMobile(),
					"showing-sidebar": !sidebarIsCollapsed(),
					"not-showing-sidebar": sidebarIsCollapsed(),
					"first-load": firstLoad(),
				})}
				sizes={sizes() ?? [0.2, 0.8]}
				onSizesChange={setSizes}>
				{() => {
					setResizableContext(Resizable.useContext())
					return (
						<>
							<Resizable.Panel
								class={bemby("chrome__sidebar", {
									"manually-resizing": manuallyDragging(),
								})}
								as="aside"
								collapsible>
								<div>
									<Button
										title="hide sidebar"
										onClick={() => collapseSidebar()}
										class="button chrome__sidebar-control chrome__sidebar-control--collapse">
										<SidebarCollapseIcon />
									</Button>
								</div>
								<Sidebar />
							</Resizable.Panel>
							<Resizable.Handle
								class="chrome__handle"
								onHandleDragStart={() => {
									setManuallyResizing(true)
								}}
								onHandleDragEnd={() => {
									setManuallyResizing(false)
									const current = currentSidebarSize()
									if (typeof current == "number" && current > 0) {
										setPreferredSidebarSize(current)
									}
								}}
							/>
							<Resizable.Panel class="chrome__main">
								<div class="chrome__main">
									<div>
										<Show when={sidebarIsCollapsed()}>
											<Button
												onDragEnter={() => expandSidebar()}
												title="show sidebar"
												onClick={() => expandSidebar()}
												class="button chrome__sidebar-control chrome__sidebar-control--expand">
												<SidebarExpandIcon />
											</Button>
										</Show>
									</div>
									<main class="chrome__content">{props.children}</main>
								</div>
							</Resizable.Panel>
						</>
					)
				}}
			</Resizable>
		</UserContext.Provider>
	)
}

function SidebarCollapseIcon() {
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

function SidebarExpandIcon() {
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
