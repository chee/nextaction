export function sortByOther<T>(secondary: T[], primary: T[]): T[] {
	console.log(secondary, primary)
	return secondary.toSorted((a, b) => primary.indexOf(a) - primary.indexOf(b))
}
