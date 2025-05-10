import "./upcoming.css"
import {createDateNow} from "@solid-primitives/date"
import type {ActionURL} from "::shapes/action.ts"
import {isClosed, isDoable, isToday} from "::shapes/mixins/doable.ts"
import type {ProjectURL} from "::shapes/project.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {
	getSelectionProps,
	type SelectionContext,
} from "::viewmodels/selection/useSelection.ts"
import type {ChildEntitiesFor} from ":concepts:"
import {isProject, useProject, type Project} from "::domain/useProject.ts"
import {isAction, useAction, type Action} from "::domain/useAction.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {Match, Show, type JSX} from "solid-js"
import * as dates from "date-fns"
import {usePageContext} from "::viewmodels/common/page.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createNewActionCommand,
	createDeleteCommand,
	createCompleteCommand,
	createCancelCommand,
} from "::viewmodels/commands/standard.ts"
import {createMemo} from "solid-js"
import {For} from "solid-js"
import {Switch} from "solid-js"
import ActionItem from "../../components/actions/action.tsx"
import type {ActionExpander} from "::viewmodels/selection/useExpander.ts"
import {ProjectItem} from "../../components/projects/project-item.tsx"
import {Entries} from "@solid-primitives/keyed"

function formatKey(date: Date) {
	return dates.format(date, "yyyy-MM-dd")
}

function daysRange(start: Date, days: number) {
	return Array.from({length: days}, (_, i) => dates.addDays(start, i))
}

import {endOfMonth, differenceInCalendarDays} from "date-fns"
import {createDropTarget} from "::viewmodels/dnd/contract.ts"
import {getMainType} from "::viewmodels/dnd/contract.ts"

function daysLeftInMonth(date: Date = new Date()): number {
	return differenceInCalendarDays(endOfMonth(date), date)
}

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

	const upcoming = usePageContext<"area">({
		items: sorted,
		selectableItemFilter: selectableItemFilter as (
			item: ChildEntitiesFor<"area">
		) => boolean,
	})

	const commandRegistry = useCommandRegistry()
	commandRegistry.addCommand(
		createNewActionCommand({
			fallbackURL: home.inbox.url!,
			selection: upcoming.selection,
			expander: upcoming.expander,
			template() {
				const selectedURL = upcoming.selection.bottomSelected()
				if (!selectedURL) return undefined
				const selected = home.keyed[selectedURL]

				return {when: selected.when}
			},
		})
	)
	commandRegistry.addCommand(createDeleteCommand(upcoming))
	commandRegistry.addCommand(createCompleteCommand(upcoming))
	commandRegistry.addCommand(createCancelCommand(upcoming))

	const grouped = createMemo(() => {
		return Object.groupBy(upcoming.selectableItems(), item =>
			formatKey((item as {when: Date}).when)
		)
	}) as () => Record<string, (Action | Project)[]>

	const tomorrow = () => dates.addDays(now(), 1)
	const thisWeek = () => daysRange(tomorrow(), 7)

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
						<For each={thisWeek()}>
							{date => {
								const dayItems = () => grouped()[formatKey(date)]
								return (
									<UpcomingDay
										date={date}
										day={date.getDate()}
										title={
											dates.isTomorrow(date)
												? "Tomorrow"
												: dates.isMonday(date)
												? "Monday"
												: dates.isTuesday(date)
												? "Tuesday"
												: dates.isWednesday(date)
												? "Wednesday"
												: dates.isThursday(date)
												? "Thursday"
												: dates.isFriday(date)
												? "Friday"
												: dates.isSaturday(date)
												? "Saturday"
												: dates.isSunday(date)
												? "Sunday"
												: date.toLocaleString("default", {
														month: "long",
														day: "numeric",
												  })
										}
										items={dayItems()}
										selection={upcoming.selection}
										expander={upcoming.expander}
									/>
								)
							}}
						</For>
						{/* <Entries of={grouped()}>
							{(dateString, items) => {
								const date = new Date(dateString)

								return (
									<Show when={dates.isAfter(date, thisWeek()[6])}>
										<div class="upcoming-day">
											<h2 class="upcoming-day__title">
												<Switch>
													<Match when={dates.isThisMonth(date)}>
														<span class="upcoming-day__name">
															The rest of{" "}
															{date.toLocaleString("default", {month: "long"})}
														</span>
													</Match>
													<Match when={dates.isThisYear(date)}>
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
												<For each={items()}>
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
									</Show>
								)
							}}
						</Entries> */}
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}

function UpcomingDay(props: {
	date: Date
	day?: number | undefined
	title: string
	items: (Action | Project)[]
	selection: SelectionContext<ActionURL | ProjectURL>
	expander: ActionExpander
}) {
	return (
		<div class="upcoming-day">
			<h2
				class="upcoming-day__title"
				ref={element => {
					createDropTarget(element, {
						accepts(payload) {
							if (!payload) return false
							return ["action", "project"].includes(getMainType(payload))
						},
						drop(payload) {
							if (!payload) return
							for (const item of payload.items) {
								if (item.type == "action") {
									useAction(() => item.url as ActionURL)?.setWhen(props.date)
								}
								if (item.type == "project") {
									useProject(() => item.url as ProjectURL)?.setWhen(props.date)
								}
							}
						},
					})
				}}>
				<Show when={props.day}>
					<span class="upcoming-day__date">{props.day}</span>
				</Show>
				<span class="upcoming-day__name">{props.title}</span>
			</h2>
			<div class="upcoming-day__items">
				<For each={props.items}>
					{item => (
						<UpcomingItem
							item={item}
							selection={props.selection}
							expander={props.expander}
						/>
					)}
				</For>
			</div>
		</div>
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
