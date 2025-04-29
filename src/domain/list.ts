export function add<Field extends string>(field: Field) {
	return function <Item>(item: Item, index?: number) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			if (!container[field].includes(item)) {
				if (
					index != null &&
					index >= 0 &&
					index < container[field].length
				) {
					container[field].splice(index, 0, item)
				} else {
					container[field].push(item)
				}
			}
		}
	}
}

export function remove<Field extends string>(field: Field) {
	return function <Item>(item: Item) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			const index = Array.from(container[field]).indexOf(item)
			if (index != -1) {
				container[field].splice(index, 1)
			}
		}
	}
}

export function move<Field extends string>(field: Field) {
	return function <Item>(items: Item | Item[], index: number) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			if (!Array.isArray(items)) {
				items = [items]
			}
			for (const item of items) {
				const currentIndex = Array.from(container[field]).indexOf(item)
				if (currentIndex != -1) {
					container[field].splice(currentIndex, 1)
				}
			}
			container[field].splice(index, 0, ...items)
		}
	}
}
