export function add<Field extends string>(field: Field) {
	return function <Item>(item: Item, index?: number) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			if (!container[field].includes(item)) {
				if (index != null && index >= 0 && index < container[field].length) {
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
	return function <Item>(newItems: Item | Item[], targetIndex: number) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			if (!Array.isArray(newItems)) newItems = [newItems]
			const list = container[field]

			const arr = [...list]
			const toInsert = newItems
				.filter(x => arr.includes(x))
				.sort((a, b) => arr.indexOf(a) - arr.indexOf(b))
			if (!toInsert.length) return

			toInsert
				.map(x => arr.indexOf(x))
				.sort((a, b) => b - a)
				.forEach(i => list.splice(i, 1))

			// clamp and insert group at final targetIndex
			const insertAt = Math.max(0, Math.min(targetIndex, list.length))
			list.splice(insertAt, 0, ...toInsert)
		}
	}
}

export function moveAfter<Field extends string>(field: Field, offset = 1) {
	return function <Item>(items: Item | Item[], target: Item) {
		return function <Container extends Record<Field, Item[]>>(
			container: Container
		) {
			if (!Array.isArray(items)) items = [items]
			const list = container[field]
			if (![...list].includes(target)) return

			items.forEach(item => {
				const itemIndex = [...list].indexOf(item)
				if (itemIndex !== -1) {
					list.splice(itemIndex, 1)
				}
			})

			const index = [...list].indexOf(target) + offset

			if (index > list.length) {
				list.push(...items)
				return
			}
			if (index < 0) {
				list.unshift(...items)
				return
			}
			list.splice(index, 0, ...items)
		}
	}
}
