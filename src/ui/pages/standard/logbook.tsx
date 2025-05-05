import "./logbook.css"
// import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import {useSelectionHotkeys} from "./inbox.tsx"
import {useHome} from "@/viewmodel/home.ts"
import {useExpander, useRecentlyRemoved} from "@/viewmodel/helpers/page.ts"
import {type ProjectURL} from "@/domain/project.ts"
import {type ActionURL} from "@/domain/action.ts"
import {isClosed, isDoable} from "@/domain/generic/doable.ts"
import {isActionViewModel, type ActionViewModel} from "@/viewmodel/action.ts"
import {isProjectViewModel, type ProjectViewModel} from "@/viewmodel/project.ts"
import {createMemo, For, Switch, Match} from "solid-js"
import flattenTree from "@/infra/lib/flattenTree.ts"
import {
	createSelectionContext,
	getSelectionProps,
} from "@/infra/hooks/selection-context.ts"
import {
	createDragAndDropContext,
	DragAndDropProvider,
} from "../../../infra/dnd/dnd-context.ts"
import DevelopmentNote from "../../components/development-note.tsx"
import type {AnyDoableViewModel} from "../../../viewmodel/mixins/doable.ts"
import type {Accessor} from "solid-js"
import {mapArray} from "solid-js"
import Action from "../../components/actions/action.tsx"
import {ProjectItem} from "../../components/projects/project-item.tsx"

// todo create a LogbookItem
export default function Logbook() {
	const home = useHome()
	const [wasRecentlyOpened, openAndHold] = useRecentlyRemoved()
	const all = createMemo(() => [...home.flat, ...home.inbox.flat])
	const filter = (item: (typeof home.list.items)[number]) =>
		isDoable(item) && (isClosed(item) || wasRecentlyOpened(item.url))
	const closed = createMemo(() => all().filter(filter)) as Accessor<
		AnyDoableViewModel[]
	>
	const sorted = createMemo(() =>
		closed().sort(
			(a, b) => a.stateChanged!.getTime() - b.stateChanged!.getTime()
		)
	)
	const selectableItemURLs = mapArray(
		() => sorted(),
		i => i.url
	)

	const toggleCompleted = (
		item: ActionViewModel | ProjectViewModel,
		force?: boolean
	) => {
		openAndHold(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (
		item: ActionViewModel | ProjectViewModel,
		force?: boolean
	) => {
		openAndHold(() => item.toggleCanceled(force), item.url)
	}

	const selection = createSelectionContext(() => selectableItemURLs())

	useSelectionHotkeys<ActionURL | ProjectURL>({
		selection,
		selectableItemURLs: selectableItemURLs,
	})

	const expander = useExpander<ActionURL>(selection)
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
									<Match when={isActionViewModel(item)}>
										<Action
											modifiers="logbook"
											{...(item as ActionViewModel)}
											toggleCompleted={f =>
												toggleCompleted(item as ActionViewModel, f)
											}
											toggleCanceled={f =>
												toggleCanceled(item as ActionViewModel, f)
											}
											{...getSelectionProps(selection, item.url)}
											{...expander.props((item as ActionViewModel).url)}
										/>
									</Match>
									<Match when={isProjectViewModel(item)}>
										<ProjectItem
											modifiers="logbook"
											{...(item as ProjectViewModel)}
											{...getSelectionProps(selection, item.url)}
											toggleCompleted={f =>
												toggleCompleted(item as ProjectViewModel, f)
											}
											toggleCanceled={f =>
												toggleCanceled(item as ProjectViewModel, f)
											}
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
