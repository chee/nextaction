import "./chrome.css"

import Sidebar from "::ui/components/sidebar/sidebar.tsx"
import {createSignal, type JSX, Show} from "solid-js"
import Resizable, {ContextValue as ResizableContext} from "@corvu/resizable"
import {makePersisted} from "@solid-primitives/storage"
import {Button} from "@kobalte/core/button"
import bemby from "bemby"
import {useIsRouting} from "@solidjs/router"
import {createEffect} from "solid-js"
import {onMount} from "solid-js"
import {createMediaQuery} from "@solid-primitives/media"
import Bar from "../components/bar/bar.tsx"
import {UserContext, useUser} from "::domain/useUser.ts"
import {
	CommandRegistryProvider,
	redo,
	undo,
	useCanUndo,
} from "::viewmodels/commands/commands.tsx"
import {createEventListener} from "@solid-primitives/event-listener"
import {clsx} from "@nberlette/clsx"
import {ReactiveSet} from "@solid-primitives/set"

const isMobile = createMediaQuery("(max-width: 600px)")

export default function Chrome(props: {children?: JSX.Element}) {
	const user = useUser()
	// eslint-disable-next-line solid/reactivity
	const [sizes, setSizes] = makePersisted(createSignal<number[]>([0.2, 0.8]), {
		name: "taskplace:chrome-sizes",
	})
	const [preferredSidebarSize, setPreferredSidebarSize] = makePersisted(
		// eslint-disable-next-line solid/reactivity
		createSignal(0.2)
	)

	const [manuallyDragging, setManuallyResizing] = createSignal(false)

	const [resizableContext, setResizableContext] =
		createSignal<ResizableContext>()
	const sidebarIsCollapsed = () => resizableContext()?.sizes()[0] === 0

	const currentSidebarSize = () => {
		return resizableContext()?.sizes()[0]
	}

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
	const [canUndo, canRedo] = useCanUndo()

	const inputDevices = new ReactiveSet<string>([])
	const coarse = createMediaQuery("(pointer: coarse)")
	const touch = () => inputDevices.has("touch") || coarse()
	const upstairs = () => !touch() && !isMobile()

	createEventListener(
		self,
		"pointerdown",
		event => {
			inputDevices.add(event.pointerType)
		},
		{
			passive: true,
		}
	)
	createEventListener(self, "keydown", () => inputDevices.add("keyboard"), {
		passive: true,
	})

	return (
		<UserContext.Provider value={user}>
			<CommandRegistryProvider>
				<Resizable
					class={clsx(
						bemby("chrome", {
							mobile: isMobile(),
							desktop: !isMobile(),
							"showing-sidebar": !sidebarIsCollapsed(),
							"not-showing-sidebar": sidebarIsCollapsed(),
							"first-load": firstLoad(),
						}),
						bemby("input-device", ...inputDevices)
					)}
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
									{/* <div>
										<Button
											title="hide sidebar"
											onClick={() => collapseSidebar()}
											class="chrome__sidebar-control chrome__sidebar-control--collapse"></Button>
									</div> */}
									<Sidebar collapse={() => collapseSidebar()} />
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
									<header class="chrome__header">
										<div class="chrome__header-left">
											<Show when={sidebarIsCollapsed()}>
												<Button
													onDragEnter={() => expandSidebar()}
													title="show sidebar"
													onClick={() => expandSidebar()}
													class="chrome__sidebar-control chrome__sidebar-control--expand">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24">
														<path
															fill="none"
															stroke="currentColor"
															stroke-dasharray="12"
															stroke-dashoffset="12"
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M8 12l7 -7M8 12l7 7">
															<animate
																fill="freeze"
																attributeName="stroke-dashoffset"
																dur="0.3s"
																values="12;0"
															/>
														</path>
													</svg>
												</Button>
											</Show>
										</div>
										<div class="chrome__header-right">
											<Show when={upstairs()}>
												<Bar modifiers="desktop" />
											</Show>
										</div>
									</header>
									<div class="chrome__content">{props.children}</div>
									<Show when={!upstairs()}>
										<footer class="chrome__footer">
											<section class="chrome__footer-left">
												<Show when={canUndo()}>
													<Button
														class="button"
														aria-label="Undo"
														onClick={() => undo()}>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="14"
															height="14"
															style={{"margin-right": "var(--space-2"}}
															viewBox="0 0 24 24">
															<path
																fill="currentColor"
																d="M7 19v-2h7.1q1.575 0 2.738-1T18 13.5T16.838 11T14.1 10H7.8l2.6 2.6L9 14L4 9l5-5l1.4 1.4L7.8 8h6.3q2.425 0 4.163 1.575T20 13.5t-1.737 3.925T14.1 19z"
															/>
														</svg>
														{/* ↩ */}
														<span class="undo-redo__text">Undo</span>
													</Button>
												</Show>
												<Show when={canRedo()}>
													<Button
														class="button"
														aria-label="Redo"
														onClick={() => redo()}>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="14"
															height="14"
															style={{"margin-right": "var(--space-2"}}
															viewBox="0 0 24 24">
															<path
																fill="currentColor"
																d="M9.9 19q-2.425 0-4.163-1.575T4 13.5t1.738-3.925T9.9 8h6.3l-2.6-2.6L15 4l5 5l-5 5l-1.4-1.4l2.6-2.6H9.9q-1.575 0-2.738 1T6 13.5T7.163 16T9.9 17H17v2z"
															/>
														</svg>
														{/*↪*/}
														<span class="undo-redo__text">Redo</span>
													</Button>
												</Show>
											</section>

											<Bar modifiers="mobile" />
										</footer>
									</Show>
								</Resizable.Panel>
							</>
						)
					}}
				</Resizable>
			</CommandRegistryProvider>
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
