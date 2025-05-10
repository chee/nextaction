import {For, Switch, Match, Show} from "solid-js"
import {isAnytime, isClosed} from "::shapes/mixins/doable.ts"

import {TodayAction} from "../today/today-action.tsx"
import {GroupedProject} from "../../components/projects/grouped-project.tsx"
import {useHomeContext} from "::domain/useHome.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {isArea, type Area} from "::domain/useArea.ts"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createCancelCommand,
	createCompleteCommand,
	createDeleteCommand,
	createNewActionCommand,
} from "::viewmodels/commands/standard.ts"
import {icons} from "../../styles/themes/themes.ts"
import {createEffect} from "solid-js"
import {on} from "solid-js"

export default function AnytimeView() {
	const home = useHomeContext()
	const items = () => home.list.items
	const anytime = usePageContext({
		items,
		selectableItemFilter: (item: (typeof home.list.flat)[number]) =>
			isAction(item) && isAnytime(item) && !item.deleted && !isClosed(item),
	})

	const toggleCompleted = (item: Action, force?: boolean) => {
		anytime.stage(() => item.toggleCompleted(force), item.url)
	}
	const toggleCanceled = (item: Action, force?: boolean) => {
		anytime.stage(() => item.toggleCanceled(force), item.url)
	}

	const commandRegistry = useCommandRegistry()

	createEffect(
		on(
			() => home.url,
			homeURL => {
				commandRegistry.addCommand(
					createNewActionCommand({
						fallbackURL: homeURL,
						selection: anytime.selection,
						expander: anytime.expander,
					})
				)
				commandRegistry.addCommand(createDeleteCommand(anytime))
				commandRegistry.addCommand(createCompleteCommand(anytime))
				commandRegistry.addCommand(createCancelCommand(anytime))
			}
		)
	)

	const {dnd, expander} = anytime

	return (
		<DragAndDropProvider value={dnd}>
			<div
				class="logbook page-container page-container--built-in"
				ref={element => dnd.createDraggableList(element)}>
				<div
					class="page anytime"
					ref={element => dnd.createDraggableList(element)}>
					<h1 class="page-title">
						<div class="page-title__icon">{icons.anytime}</div>
						<span class="page-title__title">Anytime</span>
					</h1>
					<main class="page-content">
						<For each={items()}>
							{item => (
								<Switch>
									<Match when={isAction(item) && anytime.filter(item)}>
										<TodayAction
											action={item as Action}
											selection={anytime.selection}
											expander={expander}
											toggleCompleted={() => toggleCompleted(item as Action)}
											toggleCanceled={() => toggleCanceled(item as Action)}
										/>
									</Match>
									<Match when={isProject(item)}>
										<GroupedProject
											project={item as Project}
											selection={anytime.selection}
											expander={expander}
											filter={anytime.filter}
											toggleActionCanceled={toggleCanceled}
											toggleActionCompleted={toggleCompleted}
										/>
									</Match>
									<Match when={isArea(item)}>
										<Show
											when={(item as Area).flat.filter(anytime.filter).length}>
											<For each={(item as Area).items}>
												{item => (
													<Switch>
														<Match when={isProject(item)}>
															<GroupedProject
																project={item as Project}
																selection={anytime.selection}
																expander={expander}
																filter={anytime.filter}
																toggleActionCompleted={toggleCompleted}
																toggleActionCanceled={toggleCanceled}
															/>
														</Match>
														<Match
															when={isAction(item) && anytime.filter(item)}>
															<TodayAction
																action={item as Action}
																selection={anytime.selection}
																expander={expander}
																toggleCompleted={() =>
																	toggleCompleted(item as Action)
																}
																toggleCanceled={() =>
																	toggleCanceled(item as Action)
																}
															/>
														</Match>
													</Switch>
												)}
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
