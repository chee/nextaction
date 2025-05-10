import {useTodayViewModel} from "::viewmodels/useTodayViewModel.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {For, Match, on, Show, Switch} from "solid-js"
import {isAction, type Action} from "::domain/useAction.ts"
import {TodayAction} from "./today-action.tsx"
import type {ActionURL} from "::shapes/action.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {TodayProject} from "./today-project.tsx"
import type {ProjectURL} from "::shapes/project.ts"
import {isArea, type Area} from "::domain/useArea.ts"
import type {SelectionContext} from "::viewmodels/selection/useSelection.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {createNewActionCommand} from "::viewmodels/commands/standard.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {parseIncomingWhen} from "::shapes/mixins/doable.ts"
import {createEffect} from "solid-js"
import {createDeleteCommand} from "::viewmodels/commands/standard.ts"
import {icons} from "../../styles/themes/themes.ts"

export default function Today() {
	const today = useTodayViewModel()
	const commandRegistry = useCommandRegistry()
	const home = useHomeContext()

	createEffect(
		on(
			() => home.url,
			url => {
				commandRegistry.addCommand(
					createNewActionCommand({
						fallbackURL: url,
						selection: today.selection,
						expander: today.expander,
						template: {
							when: parseIncomingWhen("today"),
						},
					})
				)
			}
		)
	)
	commandRegistry.addCommand(createDeleteCommand(today))

	return (
		<DragAndDropProvider value={today.dnd}>
			<div
				class="today page-container page-container--built-in"
				ref={element => {
					today.dnd.createDraggableList(element)
				}}>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">{icons.today}</div>
						<span class="page-title__title">Today</span>
					</h1>
					<main class="page-content">
						<For each={today.items}>
							{item => (
								<Switch>
									<Match when={isAction(item) && today.filter(item)}>
										<TodayAction
											action={item as Action}
											selection={today.selection as SelectionContext<ActionURL>}
											expander={today.expander}
											toggleCompleted={() =>
												today.toggleCompleted(item as Action)
											}
											toggleCanceled={() =>
												today.toggleCanceled(item as Action)
											}
										/>
									</Match>
									<Match when={isProject(item)}>
										<TodayProject
											project={item as Project}
											selection={
												today.selection as SelectionContext<ProjectURL>
											}
											expander={today.expander}
											filter={today.filter}
											toggleItemCompleted={today.toggleCompleted}
											toggleItemCanceled={today.toggleCanceled}
										/>
									</Match>

									<Match when={isArea(item)}>
										<Show
											when={(item as Area).flat.filter(today.filter).length}>
											<For each={(item as Area).items}>
												{item => {
													return (
														<Switch>
															<Match when={isProject(item)}>
																<TodayProject
																	project={item as Project}
																	selection={
																		today.selection as SelectionContext<ProjectURL>
																	}
																	expander={today.expander}
																	filter={today.filter}
																	toggleItemCompleted={today.toggleCompleted}
																	toggleItemCanceled={today.toggleCanceled}
																/>
															</Match>
															<Match
																when={isAction(item) && today.filter(item)}>
																<TodayAction
																	action={item as Action}
																	selection={
																		today.selection as SelectionContext<ActionURL>
																	}
																	expander={today.expander}
																	toggleCompleted={() =>
																		today.toggleCompleted(item)
																	}
																	toggleCanceled={() =>
																		today.toggleCanceled(item)
																	}
																/>
															</Match>
														</Switch>
													)
												}}
											</For>
										</Show>
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
