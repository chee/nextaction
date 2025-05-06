import "./sidebar.css"
import {A, type AnchorProps} from "@solidjs/router"
import {For, splitProps, Suspense} from "solid-js"
import type {JSX} from "solid-js"
import {useHomeContext} from "::viewmodel/home.ts"
import {
	createDropTarget,
	type DropTargetContract,
} from "::infra/dnd/contract.ts"
import {isAreaViewModel, type AreaViewModel} from "::viewmodel/area.ts"
import {isProjectViewModel, type ProjectViewModel} from "::viewmodel/project.ts"
import bemby from "bemby"
import SidebarFooter from "./sidebar-footer.tsx"
import {ContextMenu} from "@kobalte/core/context-menu"
import {encodeJSON} from "::infra/lib/compress.ts"
import {toast} from "../base/toast.tsx"
import {useDoableMixin} from "::viewmodel/mixins/doable.ts"
import {getParentURL} from "::infra/parent-registry.ts"
import {getType} from "::infra/type-registry.ts"
import {isAction, type ActionRef, type ActionURL} from "::domain/action.ts"
import {createSimpleDraggable} from "::infra/dnd/dnd-context.ts"
import {useViewModel} from "::viewmodel/useviewmodel.ts"
import DevelopmentNote from "../development-note.tsx"
import {isHeading} from "::domain/heading.ts"
import {useMovements} from "::viewmodel/movements.ts"
import {createMediaQuery} from "@solid-primitives/media"

// todo SavedSearches
// todo sidebar obviously needs a viewmodel lol
export default function Sidebar(props: {collapse: () => void}) {
	const home = useHomeContext()

	return (
		<div class="sidebar" on:sidebarclose={() => props.collapse()}>
			<div class="sidebar__links">
				<nav class="sidebar__section sidebar__section--default sidebar__section--inboxes">
					<Sidelink href="/inbox" icon="📥">
						Inbox
					</Sidelink>
				</nav>
				<nav class="sidebar__section sidebar__section--default sidebar__section--views">
					<Sidelink
						href="/today"
						icon="✨"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item => item.type === "action" || item.type == "project"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									// @ts-expect-error sidebar
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useDoableMixin(() => item.url)
									vm.setWhen("today")
								}
							},
						}}>
						Today
					</Sidelink>
					<Sidelink
						href="/upcoming"
						icon="📅"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item => item.type === "action" || item.type == "project"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									// @ts-expect-error you know
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useDoableMixin(() => item.url)
									vm.setWhen("tomorrow")
								}
							},
						}}>
						Upcoming
					</Sidelink>
					<Sidelink
						href="/anytime"
						icon="🌻"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item => item.type === "action" || item.type == "project"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									// @ts-expect-error this expect-error will be an
									// error itself soon
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useDoableMixin(() => item.url)
									vm.setWhen(undefined)
								}
							},
						}}>
						Anytime
					</Sidelink>
					<Sidelink
						href="/someday"
						icon="🎁"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item => item.type === "action" || item.type == "project"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									// @ts-expect-error fix this
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useDoableMixin(() => item.url)
									vm.setWhen("someday")
								}
							},
						}}>
						Someday
					</Sidelink>
				</nav>
				<nav class="sidebar__section sidebar__section--default sidebar__section--archive">
					<Sidelink
						href="/logbook"
						icon="✅"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item => item.type === "action" || item.type == "project"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									const parent = getParentURL(item.url as ActionURL)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useDoableMixin(() => item.url)
									vm.toggleCompleted(true)
								}
							},
						}}>
						Logbook
					</Sidelink>
					<Sidelink
						href="/trash"
						icon="🚮"
						droptarget={{
							accepts(source) {
								if (!source?.items) return false
								return source.items.every(
									item =>
										item.type === "action" ||
										item.type == "project" ||
										item.type == "area" ||
										item.type == "heading"
								)
							},
							drop(payload) {
								for (const item of payload.items) {
									const parent = getParentURL(item.url as ActionURL)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const vm = useViewModel(() => ({
										type: item.type,
										url: item.url,
									}))
									vm.delete()
								}
							},
						}}>
						Trash
					</Sidelink>
				</nav>
				<Suspense>
					<nav class="sidebar__section sidebar__section--projects">
						<For
							each={
								home.list.items.filter(
									project => isProjectViewModel(project) && !project.deleted
								) as ProjectViewModel[]
							}>
							{project => {
								return (
									<Suspense>
										<SidebarProject project={project} />
									</Suspense>
								)
							}}
						</For>
					</nav>

					<For
						each={home.list.items.filter(
							area => isAreaViewModel(area) /*&& !area.deleted*/
						)}>
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
				</Suspense>
			</div>
			<DevelopmentNote
				problems={[
					"Keyboard shortcuts have been disabled",
					"Upcoming does not exist",
					"Logbook does not exist",
					"Trash does not exist",
					"Areas do not work",
					"There are no settings",
				]}
			/>

			<SidebarFooter />
		</div>
	)
}

interface SidebarLinkProps extends AnchorProps {
	icon?: JSX.Element
	droptarget?: DropTargetContract
}

// todo move
const isMobile = createMediaQuery("(max-width: 600px)")

function Sidelink(props: SidebarLinkProps) {
	const [sidebarProps, anchorProps] = splitProps(props, ["icon", "droptarget"])

	return (
		<A
			class="sidebar-link"
			onClick={event => {
				if (isMobile()) {
					event.target.dispatchEvent(
						new CustomEvent("sidebarclose", {bubbles: true})
					)
				}
			}}
			{...anchorProps}
			ref={element => {
				if (sidebarProps.droptarget) {
					createDropTarget(element, sidebarProps.droptarget!)
				}
				if (typeof anchorProps.ref == "function") {
					anchorProps.ref(element)
				}
			}}>
			<span class="sidebar-link__icon">{sidebarProps.icon}</span>
			<span class="sidebar-link__title">{props.children}</span>
		</A>
	)
}

// todo move to own file
function SidebarProject(props: {project: ProjectViewModel}) {
	const home = useHomeContext()
	const movements = useMovements()

	return (
		<Suspense>
			<ContextMenu>
				<ContextMenu.Trigger>
					<Sidelink
						ref={element => {
							createSimpleDraggable(element, () => ({
								type: "project",
								url: props.project.url,
							}))
							createDropTarget(element, {
								accepts(source) {
									if (
										source?.items?.every(
											item => isHeading(item) || isAction(item)
										)
									)
										return true
									return false
								},
								drop(source) {
									if (!source?.items) return

									for (const item of source.items) {
										movements.reparent(item.url as ActionURL, props.project.url)
									}
								},
							})
						}}
						href={`/projects/${props.project.url}`}
						icon={props.project.icon}>
						{props.project.title}
					</Sidelink>
				</ContextMenu.Trigger>
				<ContextMenu.Portal>
					<ContextMenu.Content class="popmenu popmenu--sidebar">
						<ContextMenu.Item
							class="popmenu__item"
							onSelect={() => {
								const code = encodeJSON({
									type: props.project.type,
									url: props.project.url.replace(/.*:/, ""),
								})

								navigator.clipboard.writeText(code)

								toast.show({
									title: "Copied share link to clipboard",
									body: "Send it to your friend to give them access to this project.",
									modifiers: "copied-to-clipboard",
								})
							}}>
							Copy Share Code
						</ContextMenu.Item>
						<ContextMenu.Item
							class="popmenu__item popmenu__item--danger"
							onSelect={() => home.list.removeItemByRef(props.project)}>
							Remove from Sidebar
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Portal>
			</ContextMenu>
		</Suspense>
	)
}

function SidebarArea(props: {area: AreaViewModel}) {
	return (
		<Sidelink href={`/areas/${props.area.url}`} icon={props.area.icon}>
			{props.area.title}
		</Sidelink>
	)
}
