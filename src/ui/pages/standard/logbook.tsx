import "./logbook.css"
import {createMemo, For, Switch, Match} from "solid-js"
import {isClosed, isDoable} from "::shapes/mixins/doable.ts"
import ActionItem from "../../components/actions/action.tsx"
import {ProjectItem} from "../../components/projects/project-item.tsx"
import DevelopmentNote from "../../components/development-note.tsx"
import {usePageContext} from "::viewmodels/common/page.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {getSelectionProps} from "::viewmodels/selection/useSelection.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createCancelCommand,
	createCompleteCommand,
	createDeleteCommand,
} from "::viewmodels/commands/standard.ts"

// todo create a LogbookItem
export default function LogbookView() {
	const home = useHomeContext()
	const all = createMemo(() =>
		[...home.flat, ...home.inbox.flat].filter(
			item => isDoable(item) && isClosed(item) && !item.deleted
		)
	)
	const sorted = createMemo(() =>
		all().sort((a, b) => b.stateChanged!.getTime() - a.stateChanged!.getTime())
	)
	const logbook = usePageContext({
		items: sorted,
		selectableItemFilter() {
			return true
		},
	})

	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		logbook.stage(() => item.toggleCompleted(force), item.url)
	}

	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		logbook.stage(() => item.toggleCanceled(force), item.url)
	}

	const commandRegistry = useCommandRegistry()
	commandRegistry.addCommand(createDeleteCommand(logbook))
	commandRegistry.addCommand(createCompleteCommand(logbook))
	commandRegistry.addCommand(createCancelCommand(logbook))

	const {expander, dnd} = logbook

	return (
		<DragAndDropProvider value={dnd}>
			<div
				class="logbook page-container page-container--built-in"
				ref={element => dnd.createDraggableList(element)}>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">{icons.logbook}</div>
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
											{...getSelectionProps(logbook.selection, item.url)}
											{...expander.props((item as Action).url)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<ProjectItem
											modifiers="logbook"
											{...(item as Project)}
											{...getSelectionProps(logbook.selection, item.url)}
											toggleCompleted={f => toggleCompleted(item as Project, f)}
											toggleCanceled={f => toggleCanceled(item as Project, f)}
										/>
									</Match>
								</Switch>
							)}
						</For>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}
