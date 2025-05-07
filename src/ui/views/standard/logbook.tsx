import "./logbook.css"
// import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import {useSelectionHotkeys} from "./inbox.tsx"
import {useHomeContext} from "::domain/entities/useHome.ts"
import {createMemo, For, Switch, Match} from "solid-js"
import {mapArray} from "solid-js"
import {useStagingArea} from "::domain/state/useStagingArea.ts"
import {isClosed, isDoable} from "::shapes/mixins/doable.ts"
import type {AnyDoable} from ":concepts:"
import {isAction, type Action} from "::domain/entities/useAction.ts"
import {isProject, type Project} from "::domain/entities/useProject.ts"
import {
	createSelectionContext,
	getSelectionProps,
} from "::domain/state/useSelection.ts"
import type {ActionURL} from "::shapes/action.ts"
import type {ProjectURL} from "::shapes/project.ts"
import {useExpander} from "::domain/state/useExpander.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "::domain/dnd/dnd-context.ts"
import ActionItem from "../../components/actions/action.tsx"
import {ProjectItem} from "../../components/projects/project-item.tsx"
import DevelopmentNote from "../../components/development-note.tsx"

// todo create a LogbookItem
export default function LogbookView() {
	const home = useHomeContext()
	const [wasRecentlyOpened, openAndHold] = useStagingArea()
	const all = createMemo(() => [...home.flat, ...home.inbox.flat])
	const filter = (item: (typeof home.list.items)[number]) =>
		isDoable(item) && (isClosed(item) || wasRecentlyOpened(item.url))
	const closed = createMemo(() => all().filter(filter) as AnyDoable[])
	const sorted = createMemo(() =>
		closed().sort(
			(a, b) => b.stateChanged!.getTime() - a.stateChanged!.getTime()
		)
	)
	const selectableItemURLs = mapArray(
		() => sorted(),
		i => i.url
	)

	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		openAndHold(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		openAndHold(() => item.toggleCanceled(force), item.url)
	}

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs: selectableItemURLs,
	})

	const expander = useExpander(selection)
	const dnd = createDragAndDropContext(selection)

	return (
		<DragAndDropProvider value={dnd}>
			<div class="logbook page-container page-container--built-in">
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">✅</div>
						<span class="page-title__title">Logbook</span>
					</h1>

					<main class="page-content">
						<For each={sorted()}>
							{item => (
								<Switch>
									<Match when={isAction(item)}>
										<ActionItem
											modifiers="logbook"
											{...(item as Action)}
											toggleCompleted={f => toggleCompleted(item as Action, f)}
											toggleCanceled={f => toggleCanceled(item as Action, f)}
											{...getSelectionProps(selection, item.url)}
											{...expander.props((item as Action).url)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<ProjectItem
											modifiers="logbook"
											{...(item as Project)}
											{...getSelectionProps(selection, item.url)}
											toggleCompleted={f => toggleCompleted(item as Project, f)}
											toggleCanceled={f => toggleCanceled(item as Project, f)}
										/>
									</Match>
								</Switch>
							)}
						</For>
					</main>
				</div>
				<DevelopmentNote problems="Drag and drop doesn't yet reörder items on the Logbook" />
			</div>
		</DragAndDropProvider>
	)
}
