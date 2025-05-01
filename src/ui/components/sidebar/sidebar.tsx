import "./sidebar.css"
import {A, type AnchorProps} from "@solidjs/router"
import {For, splitProps, Suspense} from "solid-js"
import type {JSX} from "solid-js"
import {useAction} from "@/viewmodel/action.ts"
import {getOwner} from "solid-js"
import {runWithOwner} from "solid-js"
import {useHome} from "@/viewmodel/home.ts"
import {DropdownMenu} from "@kobalte/core/dropdown-menu"
import {
	createDropTarget,
	type DropTargetPayload,
} from "../../../infra/dnd/contract.ts"
import type {ActionURL} from "../../../domain/action.ts"
import {Switch} from "solid-js"
import {Match} from "solid-js"
import type {Project} from "../../../domain/project.ts"
import type {Area} from "../../../domain/area.ts"

// todo sidebar obviously needs a viewmodel lol
export default function Sidebar() {
	const owner = getOwner()
	const home = useHome()

	return (
		<div class="sidebar">
			<div class="sidebar__links">
				<nav class="sidebar__section sidebar__section--default sidebar__section--inboxes">
					<Sidelink
						href="/inbox"
						icon="📥"
						droptarget={{
							accepts: ["action"],
							drop(payload) {
								for (const url of payload.items as ActionURL[]) {
									runWithOwner(owner, () => {
										const action = useAction(() => url)
										action.when = undefined
										home.giveActionToInbox(url)
									})
								}
							},
						}}>
						Inbox
					</Sidelink>
				</nav>
				<nav class="sidebar__section sidebar__section--default sidebar__section--views">
					<Sidelink
						droptarget={{
							accepts: ["action"],
							drop(payload) {
								for (const url of payload.items as ActionURL[]) {
									runWithOwner(owner, () => {
										const action = useAction(() => url)
										action.when = "today"
										home.adoptActionFromInbox(url)
									})
								}
							},
						}}
						href="/today"
						icon="✨">
						Today
					</Sidelink>
					<Sidelink href="/upcoming" icon="📅">
						Upcoming
					</Sidelink>
					<Sidelink
						href="/anytime"
						icon="🌻"
						droptarget={{
							accepts: ["action"],
							drop(payload) {
								for (const url of payload.items as ActionURL[]) {
									runWithOwner(owner, () => {
										home.adoptActionFromInbox(url)
									})
								}
							},
						}}>
						Anytime
					</Sidelink>
					<Sidelink
						href="/someday"
						icon="🎁"
						droptarget={{
							accepts: ["action"],
							drop(payload) {
								for (const url of payload.items as ActionURL[]) {
									runWithOwner(owner, () => {
										const action = useAction(() => url)
										action.when = "someday"
										home.adoptActionFromInbox(url)
									})
								}
							},
						}}>
						Someday
					</Sidelink>
				</nav>
				<nav class="sidebar__section sidebar__section--default sidebar__section--archive">
					<Sidelink href="/logbook" icon="✅">
						Logbook
					</Sidelink>
					<Sidelink
						href="/trash"
						icon="🚮"
						droptarget={{
							accepts: ["action"],
							drop() {
								/* todo */
							},
						}}>
						Trash
					</Sidelink>
				</nav>
				<nav class="sidebar__section sidebar__section--projects">
					<Suspense>
						<For each={home.projectsAndAreas}>
							{viewmodel => {
								return (
									<Suspense>
										<Switch>
											<Match when={viewmodel.type == "project"}>
												<SidebarProject project={viewmodel} />
											</Match>
											<Match when={viewmodel.type == "area"}>
												<SidebarArea area={viewmodel} />
											</Match>
										</Switch>
									</Suspense>
								)
							}}
						</For>
					</Suspense>
				</nav>
			</div>
			{/* todo move to its own component */}
			<footer class="sidebar-footer">
				<DropdownMenu>
					<DropdownMenu.Trigger
						class="sidebar-footer__button"
						title="Add project or area">
						➕ New List
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content class="popmenu popmenu--new-list">
							<DropdownMenu.Item
								class="popmenu__item"
								onClick={() => {
									// todo create new project
									console.log("open new project")
								}}>
								<div class="sidebar-footer-new-list-choice">
									<span class="sidebar-footer-new-list-choice__title">
										<span class="sidebar-footer-new-list-choice__icon">🗂️</span>
										New Project
									</span>
									<p class="sidebar-footer-new-list-choice__description">
										A set of actions that will lead to a goal
									</p>
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="popmenu__item"
								onClick={() => {
									// todo create new area
									console.log("open new area")
								}}>
								<div class="sidebar-footer-new-list-choice">
									<span class="sidebar-footer-new-list-choice__title">
										<span class="sidebar-footer-new-list-choice__icon">🗃️</span>{" "}
										New Area
									</span>
									<p class="sidebar-footer-new-list-choice__description">
										A group of projects and actions for an area of your life
									</p>
								</div>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>

				{/* <Button
					class="sidebar-footer__button"
					aria-label="Settings"
					onClick={() => {
						// todo open settings
						console.log("open settings")
					}}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						style={{height: "1em"}}>
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2-6v4m0 4v8m4-4a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2-12v10m0 4v2m4-13a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2-3v1m0 4v11"
						/>
					</svg>
				</Button> */}
			</footer>
		</div>
	)
}

interface SidebarLinkProps extends AnchorProps {
	icon?: JSX.Element
	droptarget?: DropTargetPayload
}

function Sidelink(props: SidebarLinkProps) {
	const [sidebarProps, anchorProps] = splitProps(props, ["icon", "droptarget"])

	return (
		<A
			class="sidebar-link"
			{...anchorProps}
			ref={element => {
				if (sidebarProps.droptarget) {
					createDropTarget(element, () => sidebarProps.droptarget!)
				}
			}}>
			<span class="sidebar-link__icon">{sidebarProps.icon}</span>
			{props.children}
		</A>
	)
}

function SidebarProject(props: {project: Project}) {
	return (
		<Sidelink href={`/projects/${props.project.title}`} icon="🗂️">
			project: {props.project.title}
		</Sidelink>
	)
}

function SidebarArea(props: {area: Area}) {
	return (
		<Sidelink href={`/areas/${props.area.title}`} icon="🗃️">
			area: {props.area.title}
		</Sidelink>
	)
}
