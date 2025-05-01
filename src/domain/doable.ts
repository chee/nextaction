// todo maybe a doable should have a state of "doing" or "awaiting"
export type Doable = {
	priority?: "!" | "!!" | "!!!"
	when?: string | "someday" // "YYYY-MM-DD" | "someday"
	due?: string // "YYYY-MM-DD"
	period?: "morning" | "afternoon" | "evening"
	state: "open" | "doing" | "awaiting" | "completed" | "canceled"
	// zoozoo says you don't need reminders because you should always be
	// opening the app, and if something should happen on a certain day then
	// you should put it in your calendar
	// reminder?: number
}

export function isCompleted(thing: Doable): boolean {
	return thing.state === "completed"
}
export function isCanceled(thing: Doable): boolean {
	return thing.state === "canceled"
}
export function isOpen(thing: Doable): boolean {
	return thing.state === "open"
}
export function isDoing(thing: Doable): boolean {
	return thing.state === "doing"
}
export function isAwaiting(thing: Doable): boolean {
	return thing.state === "awaiting"
}

export function isDone(thing: Doable): boolean {
	return ["completed", "canceled"].includes(thing.state)
}

export function isSomeday(thing: Doable): boolean {
	if (!thing.when) return false
	return thing.when === "someday"
}

export function isToday(thing: Doable): boolean {
	if (!thing.when) return false
	const tonightDate = new Date()
	tonightDate.setHours(23, 59, 59, 999)
	const tonight = tonightDate.getTime()
	const when = new Date(thing.when)

	return when.getTime() < tonight
}

export function isTomorrow(thing: Doable): boolean {
	if (!thing.when) return false
	const now = new Date()
	const when = new Date(thing.when)
	return (
		when.getDate() === now.getDate() + 1 &&
		when.getMonth() === now.getMonth() &&
		when.getFullYear() === now.getFullYear()
	)
}

export function isOverdue(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return due < now
}

export function isDue(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return due <= now
}

export function isDueToday(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return (
		due.getDate() === now.getDate() &&
		due.getMonth() === now.getMonth() &&
		due.getFullYear() === now.getFullYear() &&
		!isDone(thing)
	)
}

export function isDueTomorrow(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return (
		due.getDate() === now.getDate() + 1 &&
		due.getMonth() === now.getMonth() &&
		due.getFullYear() === now.getFullYear() &&
		!isDone(thing)
	)
}

export function toggleCompleted(thing: Doable, force?: boolean) {
	if (force == null) {
		force = !isCompleted(thing)
	}
	if (force) {
		thing.state = "completed"
	} else {
		thing.state = "open"
	}
}

export function toggleCanceled(thing: Doable, force?: boolean) {
	if (force == null) {
		force = !isCanceled(thing)
	}
	if (force) {
		thing.state = "canceled"
	} else {
		thing.state = "open"
	}
}
