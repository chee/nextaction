export type DoableShape = {
	priority?: "!" | "!!" | "!!!"
	when?: Date | "someday" | null
	due?: Date | null
	period?: "morning" | "afternoon" | "evening"
	state: "open" | "doing" | "awaiting" | "completed" | "canceled"
	stateChanged?: Date | null
	deleted?: boolean
	// zoozoo says you don't need reminders because you should always be
	// opening the app, and if something should happen on a certain day then
	// you should put it in your calendar
	// reminder?: number
}

type DoableStateShape = {state: DoableShape["state"]}

export function isCompleted(thing: DoableStateShape): boolean {
	return thing.state === "completed"
}
export function isCanceled(thing: DoableStateShape): boolean {
	return thing.state === "canceled"
}
export function isOpen(thing: DoableStateShape): boolean {
	return thing.state === "open"
}
export function isDoing(thing: DoableStateShape): boolean {
	return thing.state === "doing"
}
export function isAwaiting(thing: DoableStateShape): boolean {
	return thing.state === "awaiting"
}

export function isClosed(thing: DoableStateShape): boolean {
	return ["completed", "canceled"].includes(thing.state)
}

export function isNotClosed(thing: DoableStateShape): boolean {
	return !isClosed(thing)
}

type WhenableShape = {when?: DoableShape["when"]}

export function isSomeday(thing: WhenableShape): boolean {
	if (!thing.when) return false
	return thing.when == "someday"
}

export function isAnytime(thing: WhenableShape): boolean {
	return !thing.when || isToday(thing)
}

function midnightify(date: Date): Date {
	const midnight = new Date(date)
	midnight.setHours(23, 59, 59, 999)
	return midnight
}

export function isToday(thing: WhenableShape): boolean {
	if (!thing.when) return false
	if (thing.when == "someday") return false
	const tonightDate = midnightify(new Date())
	const tonight = tonightDate.getTime()
	const when = thing.when
	return when.getTime() < tonight
}

export function isTomorrow(thing: WhenableShape): boolean {
	if (!thing.when) return false
	if (thing.when == "someday") return false
	const now = new Date()
	const when = thing.when
	return (
		when.getDate() === now.getDate() + 1 &&
		when.getMonth() === now.getMonth() &&
		when.getFullYear() === now.getFullYear()
	)
}

type DoableDueShape = {due?: DoableShape["due"]}

export function isOverdue(thing: DoableDueShape): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return due < now
}

export function isDue(thing: DoableDueShape): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return due <= now
}

export function isDueToday(thing: DoableDueShape & DoableStateShape): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return (
		due.getDate() === now.getDate() &&
		due.getMonth() === now.getMonth() &&
		due.getFullYear() === now.getFullYear() &&
		!isClosed(thing)
	)
}

export function isDueTomorrow(
	thing: DoableDueShape & DoableStateShape
): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return (
		due.getDate() === now.getDate() + 1 &&
		due.getMonth() === now.getMonth() &&
		due.getFullYear() === now.getFullYear() &&
		!isClosed(thing)
	)
}

function setState(thing: DoableShape, state: DoableShape["state"]) {
	if (thing.state !== state) {
		thing.state = state
		thing.stateChanged = new Date()
	}
}

export function toggleState(
	doable: DoableShape,
	state: DoableShape["state"],
	force?: boolean
) {
	if (force == null) {
		force = doable.state != state
	}
	if (force) {
		setState(doable, state)
	} else {
		setState(doable, "open")
	}
}

export function toggleCompleted(thing: DoableShape, force?: boolean) {
	if (force == null) {
		force = !isCompleted(thing)
	}
	setState(thing, force ? "completed" : "open")
}

export function toggleCanceled(thing: DoableShape, force?: boolean) {
	if (force == null) {
		force = !isCanceled(thing)
	}
	setState(thing, force ? "canceled" : "open")
}

function morningify(date: Date): Date {
	const morning = new Date(date)
	morning.setHours(0, 0, 0, 0)
	return morning
}

export function parseIncomingWhen(
	date: string | undefined | Date | null
): DoableShape["when"] {
	if (!date) return null

	if (date instanceof Date) {
		return morningify(date)
	}

	if (date === "today") {
		return morningify(new Date())
	}

	if (date === "tomorrow") {
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		return tomorrow
	}

	if (date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return morningify(new Date(date))
	}

	if (date == "someday") {
		return date
	}

	throw new Error(
		`Invalid date format: ${date}. Expected YYYY-MM-DD, "today", "tomorrow", or "someday".`
	)
}

export function setWhenFromFancy(
	thing: DoableShape,
	date: "someday" | "today" | "tomorrow" | string | undefined | Date
) {
	if (!date) {
		delete thing.when
		return
	}
	thing.when = parseIncomingWhen(date)
}

export function isDoable(thing: unknown): thing is DoableShape {
	return (
		typeof (thing as DoableShape).state === "string" &&
		["open", "doing", "awaiting", "completed", "canceled"].includes(
			(thing as DoableShape).state
		)
	)
}
