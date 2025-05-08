import ActionList from "::ui/components/actions/action-list.tsx"
import {For, Match, Show, Switch} from "solid-js"
import {TodayAction} from "../today/today-action.tsx"
import {TodayProject} from "../today/today-project.tsx"
import DevelopmentNote from "../../components/development-note.tsx"
import {useHomeContext} from "::domain/useHome.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {isClosed, isSomeday} from "::shapes/mixins/doable.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {isArea, type Area} from "::domain/useArea.ts"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createCancelCommand,
	createCompleteCommand,
	createDeleteCommand,
	createNewActionCommand,
} from "::viewmodels/commands/standard.ts"

export default function SomedayView() {
	const home = useHomeContext()
	const someday = usePageContext({
		items: () => home.list.flat,
		selectableItemFilter: (item: (typeof home.list.flat)[number]) =>
			(isProject(item) || isAction(item)) &&
			isSomeday(item) &&
			!item.deleted &&
			!isClosed(item),
	})

	const toggleCompleted = (item: Action | Project, force?: boolean) => {
		someday.stage(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: Action | Project, force?: boolean) => {
		someday.stage(() => item.toggleCanceled(force), item.url)
	}

	const commandRegistry = useCommandRegistry()
	commandRegistry.addCommand(
		createNewActionCommand({
			fallbackURL: home.inbox.url!,
			selection: someday.selection,
			expander: someday.expander,
		})
	)
	commandRegistry.addCommand(createDeleteCommand(someday))
	commandRegistry.addCommand(createCompleteCommand(someday))
	commandRegistry.addCommand(createCancelCommand(someday))

	return (
		<DragAndDropProvider value={someday.dnd}>
			<div
				class="today page-container page-container--built-in"
				ref={element => someday.dnd.createDraggableList(element)}>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">🎁</div>
						<span class="page-title__title">Someday</span>
					</h1>

					<main class="page-content">
						<For each={home.list.items}>
							{item => (
								<Switch>
									<Match when={isAction(item) && someday.filter(item)}>
										<TodayAction
											action={item as Action}
											selection={someday.selection}
											expander={someday.expander}
											toggleCompleted={() => toggleCompleted(item as Action)}
											toggleCanceled={() => toggleCanceled(item as Action)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<TodayProject
											project={item as Project}
											selection={someday.selection}
											expander={someday.expander}
											filter={someday.filter}
											toggleItemCompleted={toggleCompleted}
											toggleItemCanceled={toggleCanceled}
										/>
									</Match>
									{/* todo this might not be right */}
									<Match when={isArea(item)}>
										<Show
											when={(item as Area).items.filter(someday.filter).length}>
											<Switch>
												<Match when={isProject(item)}>
													<TodayProject
														project={item as Project}
														selection={someday.selection}
														expander={someday.expander}
														filter={someday.filter}
														toggleItemCompleted={toggleCompleted}
														toggleItemCanceled={toggleCanceled}
													/>
												</Match>
												<Match when={isAction(item)}>
													<TodayAction
														action={item as Action}
														selection={someday.selection}
														expander={someday.expander}
														toggleCompleted={() =>
															toggleCompleted(item as Action)
														}
														toggleCanceled={() =>
															toggleCanceled(item as Action)
														}
													/>
												</Match>
											</Switch>
										</Show>
										<h3>{item.title}</h3>
										<ActionList
											actions={(item as Area).items
												.filter(isAction)
												.filter(someday.filter)}
											selection={someday.selection}
											isSelected={someday.selection.isSelected}
											{...someday.expander}
											toggleCanceled={() => {}}
											toggleCompleted={() => {}}
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
