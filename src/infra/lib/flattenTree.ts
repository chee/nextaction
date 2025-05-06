export default function flattenTree<T extends object>(tree: T[]): T[] {
	return tree.reduce((list, item) => {
		list.push(item)

		if ("items" in item && Array.isArray(item.items)) {
			list.push(...flattenTree(item.items))
		}

		return list
	}, [] as T[])
}

export function flatfilter<T extends object>(
	tree: T[],
	filter: (i: T) => boolean
): T[] {
	return tree.filter(filter).reduce((list, item) => {
		list.push(item)

		if ("items" in item && Array.isArray(item.items)) {
			list.push(...flattenTree(item.items))
		}

		return list
	}, [] as T[])
}
