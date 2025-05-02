import "./sidebar.css"
import {A, type AnchorProps} from "@solidjs/router"
import {For, splitProps, Suspense} from "solid-js"
import type {JSX} from "solid-js"
import {useAction} from "@/viewmodel/action.ts"
import {getOwner} from "solid-js"
import {runWithOwner} from "solid-js"
import {useHome} from "@/viewmodel/home.ts"
import {DropdownMenu} from "@kobalte/core/dropdown-menu"
import {createDropTarget, type DropTargetPayload} from "@/infra/dnd/contract.ts"
import {Action, type ActionURL} from "@/domain/action.ts"
import {Button} from "@kobalte/core/button"
import type {AreaViewModel} from "@/viewmodel/area.ts"
import type {ProjectViewModel} from "@/viewmodel/project.ts"
import bemby from "bemby"
import {toast} from "../base/toast.tsx"
import Project from "../../pages/project.tsx"
import repo from "../../../infra/sync/automerge-repo.ts"
import {refer} from "../../../domain/reference.ts"
import type {ProjectURL} from "../../../domain/project.ts"

// todo SavedSearches
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
										action.clearWhen()
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
										action.setWhen("today")
										home.adoptActionFromInbox(url)
									})
								}
							},
						}}
						href="/today"
						icon="✨">
						Today
					</Sidelink>
					<Sidelink
						href="/upcoming"
						icon="📅"
						droptarget={{
							accepts: ["action"],
							drop(payload) {
								for (const url of payload.items as ActionURL[]) {
									runWithOwner(owner, () => {
										home.adoptActionFromInbox(url)
										const action = useAction(() => url)
										action.setWhen("tomorrow")
									})
								}
							},
						}}>
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
										const action = useAction(() => url)
										action.clearWhen()
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
										action.setWhen("someday")
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
						<For each={home.projects}>
							{project => {
								return (
									<Suspense>
										<SidebarProject project={project} />
									</Suspense>
								)
							}}
						</For>
					</Suspense>
				</nav>

				<For each={home.areas}>
					{area => {
						return (
							<Suspense>
								<nav class={bemby("sidebar__section", "area")}>
									<SidebarArea area={area} />
								</nav>
							</Suspense>
						)
					}}
				</For>
			</div>
			{/* todo move to its own component */}
			<footer class="sidebar-footer">
				<DropdownMenu>
					<DropdownMenu.Trigger
						class="sidebar-footer__button"
						title="Add project or area">
						➕ <span class="sidebar-footer__optional-text">Add List</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content class="popmenu popmenu--new-list">
							<DropdownMenu.Item
								class="popmenu__item"
								onClick={() => {
									home.newProject()
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
									home.newArea()
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
							<DropdownMenu.Item
								class="popmenu__item"
								onClick={() => {
									// const ref = window.prompt("")
									// home.newArea()
								}}>
								<div class="sidebar-footer-new-list-choice">
									<span class="sidebar-footer-new-list-choice__title">
										<span class="sidebar-footer-new-list-choice__icon">👯</span>{" "}
										Import from friend
									</span>
									<p class="sidebar-footer-new-list-choice__description">
										Import a project or area from a friend
									</p>
								</div>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>

				<Button
					class="sidebar-footer__button"
					title="Open settings"
					onClick={() => {
						toast.show({
							title: "Settings?",
							body: "lol! what settings?",
						})
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
				</Button>
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
			<span class="sidebar-link__title">{props.children}</span>
		</A>
	)
}

function SidebarProject(props: {project: ProjectViewModel}) {
	const home = useHome()
	return (
		<Sidelink
			href={`/projects/${props.project.url}`}
			icon={props.project.icon}
			droptarget={{
				accepts: ["action"],
				drop(payload) {
					// todo payload.items should be refs, silly.
					// todo refactor dnd to use refs
					// todo refactor accepts to be a func?
					// todo move this to sidebar viewmodel
					for (const url of payload.items as ActionURL[]) {
						console.log("dropping", url)
						repo.find<Action>(url).then(action => {
							action.change(action => {
								action.parent = refer(
									"project",
									props.project.url as ProjectURL
								)
							})
						})
						home.adoptActionFromInbox(url)
					}
				},
			}}>
			{props.project.title}
		</Sidelink>
	)
}

function SidebarArea(props: {area: AreaViewModel}) {
	const home = useHome()
	return (
		<Sidelink
			href={`/areas/${props.area.url}`}
			icon={props.area.icon}
			droptarget={{
				accepts: ["action"],
				drop(payload) {
					// todo payload.items should be refs, silly.
					// todo refactor dnd to use refs
					// todo refactor accepts to be a func?
					// todo move this to sidebar viewmodel
					for (const url of payload.items as ActionURL[]) {
						console.log("dropping", url)
						repo.find<Action>(url).then(action => {
							action.change(action => {
								action.parent = refer("area", props.area.url)
							})
						})
						home.adoptActionFromInbox(url)
					}
				},
			}}>
			{props.area.title}
		</Sidelink>
	)
}
