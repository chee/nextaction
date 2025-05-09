import "./when.css"
import Calendar from "@corvu/calendar"
import Popover from "@corvu/popover"
import {Index, Match, Show, Switch} from "solid-js"
import {isToday, isTomorrow, isYesterday} from "::shapes/mixins/doable.ts"
import type {Action} from "::domain/useAction.ts"
import bemby from "bemby"
import {icons} from "../../styles/themes/themes.ts"

export default function When(action: Action) {
	const reset = (
		<button
			type="reset"
			class="x-button"
			onClick={event => {
				event.stopPropagation()
				event.stopImmediatePropagation()
				action.clearWhen()
			}}>
			<svg
				class="x"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round">
				<path d="M18 6L6 18" />
				<path d="M6 6l12 12" />
			</svg>
		</button>
	)

	return (
		<article
			class="when"
			onClick={event => {
				event.stopPropagation()
				event.stopImmediatePropagation()
			}}>
			<Popover
				placement="bottom-start"
				floatingOptions={{
					offset: 5,
					// flip: true,
					autoPlacement: true,
				}}
				// initialFocusEl={calendar.focusedDayRef ?? undefined}
				trapFocus>
				<Calendar
					onValueChange={date => action.setWhen(date)}
					value={action.when instanceof Date ? action.when : undefined}
					mode="single"
					disabled={day => {
						return isYesterday({when: day})
					}}
					disableOutsideDays={false}>
					{calendar => (
						<>
							<Popover.Trigger
								class={bemby("when-button", {
									placeholder: !(action.when instanceof Date),
									active:
										action.when instanceof Date || action.when == "someday",
									someday: action.when == "someday",
								})}>
								<Show
									when={action.when instanceof Date}
									fallback={
										<Show
											when={action.when == "someday"}
											fallback={
												<span class="when-button__fallback">When</span>
											}>
											<span>{icons.someday} Someday</span>
											{reset}
										</Show>
									}>
									<Switch>
										<Match when={isToday({when: calendar.value})}>
											<span>{icons.today} Today</span>
										</Match>
										<Match when={isTomorrow({when: calendar.value})}>
											<span>{icons.upcoming} Tomorrow</span>
										</Match>
										<Match
											when={
												calendar.value!.getFullYear() ==
													new Date().getFullYear() &&
												calendar.value!.getTime() - new Date().getTime() <
													5 * 24 * 60 * 60 * 1000
											}>
											<span>
												{icons.upcoming}{" "}
												{calendar.value!.toLocaleDateString(undefined, {
													weekday: "long",
												})}
											</span>
										</Match>
										<Match
											when={
												calendar.value!.getFullYear() ==
												new Date().getFullYear()
											}>
											<span>
												{icons.upcoming}{" "}
												{calendar.value!.toLocaleDateString(undefined, {
													weekday: "short",
													day: "numeric",
													month: "short",
												})}
											</span>
										</Match>

										<Match when={calendar.value}>
											<span>
												{icons.upcoming}{" "}
												{calendar.value!.toLocaleDateString(undefined, {
													day: "numeric",
													month: "short",
												})}
											</span>
										</Match>
									</Switch>
									{reset}
								</Show>
							</Popover.Trigger>
							<Popover.Portal>
								{/* todo pull this part out */}
								<Popover.Content class="popmenu">
									<div class="when-calendar">
										<nav class="when-calendar__nav">
											<Calendar.Nav action="prev-month">⏮</Calendar.Nav>
											<Calendar.Label>
												{calendar.month.toLocaleDateString(undefined, {
													month: "short",
												})}{" "}
												{calendar.month.getFullYear()}
											</Calendar.Label>
											<Calendar.Nav action="next-month">⏭</Calendar.Nav>
										</nav>

										<Calendar.Table>
											<thead class="when-calendar__daynames">
												<tr>
													<Index each={calendar.weekdays}>
														{weekday => (
															<Calendar.HeadCell>
																{weekday().toLocaleString(undefined, {
																	weekday: "short",
																})}
															</Calendar.HeadCell>
														)}
													</Index>
												</tr>
											</thead>
											<tbody>
												<Index each={calendar.weeks}>
													{week => (
														<tr>
															<Index each={week()}>
																{day => (
																	<Calendar.Cell>
																		<Calendar.CellTrigger day={day()}>
																			<Show
																				when={isToday({when: day()})}
																				fallback={day().getDate()}>
																				{icons.today}
																			</Show>
																		</Calendar.CellTrigger>
																	</Calendar.Cell>
																)}
															</Index>
														</tr>
													)}
												</Index>
											</tbody>
										</Calendar.Table>
									</div>
								</Popover.Content>
							</Popover.Portal>
						</>
					)}
				</Calendar>
			</Popover>
		</article>
	)
}
