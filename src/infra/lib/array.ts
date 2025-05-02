export function sortByOther<T>(secondary: T[], primary: T[]): T[] {
	return secondary.toSorted((a, b) => primary.indexOf(a) - primary.indexOf(b))
}

export function filterDuplicates(array) {
	const seen = new Set()
	const duplicates = new Set()
	array.forEach((item, index) => {
		if (seen.has(item.url)) {
			duplicates.add(index)
		}
		seen.add(item.url)
	})
	for (const index of duplicates) {
		array.splice(index, 1)
	}
}
