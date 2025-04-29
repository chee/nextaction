import "./sidebar.css"
import { A, type AnchorProps } from "@solidjs/router"
import { splitProps } from "solid-js"
import type { JSX } from "solid-js"
import { droptarget } from "@/infra/dnd/directives.ts"

export default function Sidebar() {
	return (
		<div class="sidebar">
			<nav class="sidebar__section sidebar__section--default sidebar__section--inboxes">
				<Sidelink href="/inbox" icon="📥">
					Inbox
				</Sidelink>
			</nav>
			<nav class="sidebar__section sidebar__section--default sidebar__section--views">
				<Sidelink href="/today" icon="✨">
					Today
				</Sidelink>
				<Sidelink href="/upcoming" icon="📅">
					Upcoming
				</Sidelink>
				<Sidelink href="/anytime" icon="🌻">
					Anytime
				</Sidelink>
				<Sidelink href="/someday" icon="🎁">
					Someday
				</Sidelink>
			</nav>

			<nav class="sidebar__section sidebar__section--default sidebar__section--archive">
				<Sidelink href="/logbook" icon="✅" nodrop>
					Logbook
				</Sidelink>
				<Sidelink href="/trash" icon="🚮">
					Trash
				</Sidelink>
			</nav>

			{
				/* <nav class="sidebar__section sidebar__section--projects">
				<Suspense>
					<For each={home()?.items}>
						{projectOrAreaURL => {
							const [projectOrArea] = useDocument<Project | Area>(
								() => projectOrAreaURL
							)
							const type = () => projectOrArea()?.type
							const fallbackIcon = () =>
								type() === "project" ? "🗂️" : "🗃️"
							// todo actually if it's an area we need to create a menu
							// subsection
							// and iterate through the area's projects
							// todo also project links need to show they are a project visually
							return (
								<Suspense>
									<Sidelink
										href={`/${type()}/${projectOrAreaURL}`}
										icon={projectOrArea()?.icon ?? fallbackIcon()}>
										{projectOrArea()?.title}
									</Sidelink>
								</Suspense>
							)
						}}
					</For>
				</Suspense>
			</nav> */
			}
		</div>
	)
}

interface SidebarLinkProps extends AnchorProps {
	icon?: JSX.Element
	nodrop?: boolean
	// todo canDrop
	// todo onDrop
}

function Sidelink(props: SidebarLinkProps) {
	const [sidebarProps, anchorProps] = splitProps(props, ["icon", "nodrop"])

	return (
		<A
			class="sidebar-link"
			{...anchorProps}
			// todo canDrop is a viewmodel concern, specific to each sidebar item!
			ref={(el) => sidebarProps.nodrop || droptarget(el, {})}
		>
			<span class="sidebar-link__icon">{sidebarProps.icon}</span>
			{props.children}
		</A>
	)
}
