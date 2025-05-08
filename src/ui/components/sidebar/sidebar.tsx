import "./sidebar.css"
import {A, type AnchorProps} from "@solidjs/router"
import {For, Show, splitProps} from "solid-js"
import type {JSX} from "solid-js"

import bemby from "bemby"
import SidebarFooter from "./sidebar-footer.tsx"
import {ContextMenu} from "@kobalte/core/context-menu"
import {toast} from "../base/toast.tsx"
import {createMediaQuery} from "@solid-primitives/media"
import {useDoableMixin} from "::domain/mixins/doable.ts"
import type {ActionRef, ActionURL} from "::shapes/action.ts"
import DevelopmentNote from "../development-note.tsx"
import {encodeJSON} from "::core/util/compress.ts"
import {useModel, useModelAfterDark} from "::domain/useModel.ts"
import type {AnyParentType, ChildURLsFor} from ":concepts:"
import {useHomeContext} from "::domain/useHome.ts"
import {getParentURL} from "::registries/parent-registry.ts"
import {getType} from "::registries/type-registry.ts"
import {
	createDropTarget,
	type DropTargetContract,
} from "::viewmodels/dnd/contract.ts"
import {useMovements} from "::domain/movements/useMovements.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {createSimpleDraggable} from "::viewmodels/dnd/dnd-context.ts"
import {isHeading} from "::domain/useHeading.ts"
import {isAction} from "::domain/useAction.ts"
import {isArea, type Area} from "::domain/useArea.ts"

// todo SavedSearches
// todo sidebar obviously needs a viewmodel lol
export default function Sidebar(props: {collapse: () => void}) {
	const home = useHomeContext()

	return (
		<div
			class="sidebar"
			// @ts-expect-error ok
			on:sidebarclose={() => props.collapse()}>
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
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const doable = useDoableMixin(
										() => item.url as ChildURLsFor<"area">
									)
									doable.setWhen("today")
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
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const doable = useDoableMixin(
										() => item.url as ChildURLsFor<"area">
									)
									doable.setWhen("tomorrow")
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
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const doable = useDoableMixin(() => item.url as ActionURL)
									doable.setWhen(undefined)
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
									const parent = getParentURL(item.url)
									const parentType = getType(parent)
									if (parentType === "inbox") {
										home.adoptActionFromInbox(item as ActionRef)
									}
									const doable = useDoableMixin(() => item.url as ActionURL)
									doable.setWhen("someday")
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
									const doable = useDoableMixin(() => item.url as ActionURL)
									doable.toggleCompleted(true)
								}
							},
						}}>
						Logbook
					</Sidelink>
					<Sidelink
						href="/trash"
						icon="🚮"
						onDblClick={event => {
							if (event.altKey) {
								console.log("empty trash")
								for (const item of home.flat) {
									if (item.deleted || item.archives) {
										const parent = getParentURL(item.url as ActionURL)
										const parentType = getType(parent)
										if (parentType === "inbox") {
											home.inbox.hasItem(item.type, item.url)
											home.inbox.removeItem(item.type, item.url)
										} else if (parentType == "home") {
											home.list.removeItem(item.type, item.url)
										} else {
											const model = useModelAfterDark(parent)
											console.log(model)
											model.removeItem(item.type, item.url)
										}
									}
								}
							}
						}}
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
									const model = useModel(() => ({
										type: item.type,
										url: item.url,
									}))
									model.delete()
								}
							},
						}}>
						Trash
					</Sidelink>
				</nav>

				<nav class="sidebar__section sidebar__section--projects">
					<For
						each={
							home.list.items.filter(
								project => isProject(project) && !project.deleted
							) as Project[]
						}>
						{project => <SidebarProject project={project} />}
					</For>
				</nav>

				<For
					each={home.list.items.filter(
						area => isArea(area) /*&& !area.deleted*/
					)}>
					{area => (
						<nav class={bemby("sidebar__section", "area")}>
							<SidebarArea area={area} />
						</nav>
					)}
				</For>
			</div>
			<DevelopmentNote
				problems={[
					// todo before spain
					"Keyboard shortcuts have been disabled",
					// todo before spain
					"Upcoming does not exist",
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
	icon: JSX.Element

	droptarget?: DropTargetContract<AnyParentType>
}

// todo move
const isMobile = createMediaQuery("(max-width: 600px)")

function Sidelink(props: SidebarLinkProps) {
	const [sidebarProps, anchorProps] = splitProps(props, ["icon", "droptarget"])

	return (
		<Show when={sidebarProps.icon}>
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
		</Show>
	)
}

// todo move to own file
function SidebarProject(props: {project: Project}) {
	const home = useHomeContext()
	const movements = useMovements()

	return (
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
						onSelect={() => {
							home.list.removeItemByRef(props.project)
						}}>
						Remove from Sidebar
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu>
	)
}

function SidebarArea(props: {area: Area}) {
	return (
		<Sidelink href={`/areas/${props.area.url}`} icon={props.area.icon}>
			{props.area.title}
		</Sidelink>
	)
}
