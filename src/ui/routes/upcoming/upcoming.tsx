import "./upcoming.css"
import {createDateNow} from "@solid-primitives/date"
import type {ActionURL} from "::shapes/action.ts"
import {isClosed, isDoable, isToday} from "::shapes/mixins/doable.ts"
import type {ProjectURL} from "::shapes/project.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {
	createSelectionContext,
	getSelectionProps,
	type SelectionContext,
} from "::viewmodels/selection/useSelection.ts"
import type {ChildEntitiesFor} from ":concepts:"
import {isProject, type Project} from "::domain/useProject.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {Match} from "solid-js"
import * as datefns from "date-fns"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createNewActionCommand,
	createDeleteCommand,
	createCompleteCommand,
	createCancelCommand,
} from "::viewmodels/commands/standard.ts"
import {createMemo} from "solid-js"
import {createEffect} from "solid-js"
import {For} from "solid-js"
import {Switch} from "solid-js"
import ActionItem from "../../components/actions/action.tsx"
import type {ActionExpander} from "::viewmodels/selection/useExpander.ts"
import {ProjectItem} from "../../components/projects/project-item.tsx"
export default function UpcomingView() {
	const [now] = createDateNow(60 * 1000)

	const home = useHomeContext()

	// todo so there are two stages to the filter,
	// the type of items and then whether they are deleted/closed as long as they
	// aren't in the recently deleted. that part needs to only happen after
	// selection and staging was created
	const upcomingItemsFilter = (item: ChildEntitiesFor<"home">) =>
		Boolean(
			isDoable(item) && item.when && item.when != "someday" && !isToday(item)
		)
	const selectableItemFilter = (item: ChildEntitiesFor<"home">) =>
		Boolean(
			upcomingItemsFilter(item) &&
				!(item as Action | Project).deleted &&
				!isClosed(item as Action | Project)
		)

	const items = createMemo(
		() =>
			home.list.flat.filter(item => upcomingItemsFilter(item)) as (
				| Action
				| Project
			)[]
	)

	const sorted = createMemo(() =>
		items().sort((a, b) => {
			if (a.when == b.when) {
				return 0
			}
			if (a.when == "someday") {
				return 1
			}
			if (b.when == "someday") {
				return -1
			}
			if (!a.when) {
				return 1
			}
			if (!b.when) {
				return -1
			}
			return a.when > b.when ? 1 : -1
		})
	)

	const upcoming = usePageContext({
		items: sorted,
		selectableItemFilter,
	})

	const commandRegistry = useCommandRegistry()
	commandRegistry.addCommand(
		createNewActionCommand({
			fallbackURL: home.inbox.url!,
			selection: upcoming.selection,
			expander: upcoming.expander,
		})
	)
	commandRegistry.addCommand(createDeleteCommand(upcoming))
	commandRegistry.addCommand(createCompleteCommand(upcoming))
	commandRegistry.addCommand(createCancelCommand(upcoming))

	const grouped = createMemo(() => {
		return Object.groupBy(upcoming.items, item =>
			datefns.format((item as {when: Date}).when, "yyyy-MM-dd")
		)
	}) as () => Record<string, (Action | Project)[]>

	return (
		<DragAndDropProvider value={upcoming.dnd}>
			<div
				ref={element => {
					upcoming.dnd.createDraggableList(element)
				}}
				class="upcoming page-container page-container--built-in">
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">📅</div>
						<span class="page-title__title">Upcoming</span>
					</h1>

					<main class="page-content">
						<For each={Object.entries(grouped())}>
							{([dateString, items]) => {
								const date = new Date(dateString)
								const day = (
									<span class="upcoming-day__date">{date.getDate()}</span>
								)
								return (
									<div class="upcoming-day">
										<h2 class="upcoming-day__title">
											<Switch>
												<Match when={datefns.isTomorrow(date)}>
													{day}
													<span class="upcoming-day__name">Tomorrow</span>
												</Match>
												<Match
													when={datefns.isWithinInterval(date, {
														start: now(),
														end: datefns.addDays(now(), 7),
													})}>
													<Switch>
														<Match when={datefns.isMonday(date)}>
															{day}
															<span class="upcoming-day__name">Monday</span>
														</Match>
														<Match when={datefns.isTuesday(date)}>
															{day}
															<span class="upcoming-day__name">Tuesday</span>
														</Match>
														<Match when={datefns.isWednesday(date)}>
															{day}
															<span class="upcoming-day__name">Wednesday</span>
														</Match>
														<Match when={datefns.isThursday(date)}>
															{day}
															<span class="upcoming-day__name">Thursday</span>
														</Match>
														<Match when={datefns.isFriday(date)}>
															{day}
															<span class="upcoming-day__name">Fishday</span>
														</Match>
														<Match when={datefns.isSaturday(date)}>
															{day}
															<span class="upcoming-day__name">Saturday</span>
														</Match>
														<Match when={datefns.isSunday(date)}>
															{day}
															<span class="upcoming-day__name">Sunday</span>
														</Match>
													</Switch>
												</Match>
												<Match when={datefns.isThisMonth(date)}>
													<span class="upcoming-day__name">
														The rest of{" "}
														{date.toLocaleString("default", {month: "long"})}
													</span>
												</Match>
												<Match when={datefns.isThisYear(date)}>
													<span class="upcoming-day__name">
														The rest of{" "}
														{date.toLocaleString("default", {
															year: "numeric",
														})}
													</span>
												</Match>
												<Match when={1}>
													<span class="upcoming-day__name">
														The rest of your life
													</span>
												</Match>
											</Switch>
										</h2>
										<div class="upcoming-day__items">
											<For each={items}>
												{item => (
													<UpcomingItem
														item={item}
														selection={upcoming.selection}
														expander={upcoming.expander}
													/>
												)}
											</For>{" "}
										</div>
									</div>
								)
							}}
						</For>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}

function UpcomingItem(props: {
	item: Action | Project
	selection: SelectionContext<ActionURL | ProjectURL>
	expander: ActionExpander
}) {
	return (
		<Switch>
			<Match when={isAction(props.item)}>
				<ActionItem
					{...(props.item as Action)}
					{...getSelectionProps(props.selection, props.item.url)}
					expanded={props.expander.isExpanded(props.item.url as ActionURL)}
					expand={() => props.expander.expand(props.item.url as ActionURL)}
					collapse={() => props.expander.collapse()}
				/>
			</Match>
			<Match when={isProject(props.item)}>
				<ProjectItem
					{...(props.item as Project)}
					{...getSelectionProps(props.selection, props.item.url)}
				/>
			</Match>
		</Switch>
	)
}
