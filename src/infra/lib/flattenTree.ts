export default function flattenTree<
	T extends Record<string, unknown> & {
		// deno-lint-ignore no-explicit-any
		items?: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
		url: string
	}
>(tree: T[]): T[] {
	return tree.reduce((list, item) => {
		list.push(item)

		if ("items" in item && Array.isArray(item.items)) {
			list.push(...flattenTree(item.items))
		}

		return list
	}, [] as (T & {parent?: string})[])
}
