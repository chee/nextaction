import "./project.css"
import {useParams} from "@solidjs/router"
import type {ProjectURL} from "@/domain/project.ts"
import {useProjectPage} from "@/viewmodel/pages/project-page.ts"
import {PageContext} from "@/viewmodel/generic/page.ts"
import Bar, {BarMenu, BarNewAction} from "@/ui/components/bar/bar.tsx"
import ActionList from "../components/actions/action-list.tsx"
import NotesEditor from "../components/editor/notes-editor.tsx"
import TitleEditor from "../components/editor/title-editor.tsx"
import {createSignal} from "solid-js"
import {Popover} from "@kobalte/core/popover"
import EmojiPicker from "../components/emoji-picker.tsx"

export default function Project() {
	const params = useParams<{projectId: ProjectURL}>()
	const page = useProjectPage(() => params.projectId)
	const titleExtension = () => page.project.titleSyncExtension
	const notesExtension = () => page.project.notesSyncExtension

	return (
		<PageContext.Provider value={page}>
			<div class="inbox page-container">
				<Bar>
					<BarNewAction />
					<BarMenu />
				</Bar>

				<div class="page">
					<h1 class="page-title">
						<EmojiPicker
							icon={page.project.icon}
							modifiers={["project-title", "page-title"]}
							onEmoji={emoji => {
								page.project.icon = emoji
							}}
						/>

						<TitleEditor
							doc={page.project.title}
							blur={() => {}}
							placeholder="project"
							syncExtension={titleExtension()}
							modifiers="project"
							submit={() => {}}
						/>
					</h1>
					<main class="page-content">
						<NotesEditor
							doc={page.project.notes}
							blur={() => {}}
							placeholder="Notes"
							syncExtension={notesExtension()}
							modifiers="project"
						/>

						<ActionList
							selection={page.selection}
							expand={page.expand}
							collapse={page.collapse}
							isSelected={page.selection.isSelected}
							isExpanded={page.isExpanded}
							actions={page.visibleItems}
						/>
					</main>
				</div>
			</div>
		</PageContext.Provider>
	)
}
