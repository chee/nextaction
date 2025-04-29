// todo maybe a doable should have a state of "doing" or "awaiting"
export interface Doable {
	done?: Date
	priority?: "!" | "!!" | "!!!"
	when?: string | "someday" // "YYYY-MM-DD" | "someday"
	due?: string // "YYYY-MM-DD"
	period?: "morning" | "afternoon" | "evening"
	// zoozoo says you don't need reminders because you should always be
	// opening the app, and if something should happen on a certain day then
	// you should put it in your calendar
	// reminder?: number
}

export function isComplete(thing: Doable): boolean {
	return !!thing.done
}
export function isSomeday(thing: Doable): boolean {
	if (!thing.when) return false
	return thing.when === "someday"
}
export function isToday(thing: Doable): boolean {
	if (!thing.when) return false
	const now = new Date()
	const when = new Date(thing.when)
	return (
		when.getDate() === now.getDate() &&
		when.getMonth() === now.getMonth() &&
		when.getFullYear() === now.getFullYear()
	)
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
	return due < now && !isComplete(thing)
}

export function isDue(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return due <= now && !isComplete(thing)
}

export function isDueToday(thing: Doable): boolean {
	if (!thing.due) return false
	const now = new Date()
	const due = new Date(thing.due)
	return (
		due.getDate() === now.getDate() &&
		due.getMonth() === now.getMonth() &&
		due.getFullYear() === now.getFullYear() &&
		!isComplete(thing)
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
		!isComplete(thing)
	)
}
