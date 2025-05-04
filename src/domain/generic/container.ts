export const CanContain = {
	home: ["area", "action", "project"] as const,
	inbox: ["action"] as const,
	area: ["action", "project"] as const,
	project: ["action", "heading"] as const,
	heading: ["action"] as const,
	action: [] as const,
} as const

export type CanContain = typeof CanContain

export type CanContainType<T extends keyof CanContain> = CanContain[T][number]
export type CanContainTypes = {
	[K in keyof CanContain]: CanContainType<K>
}[keyof CanContain]

export function canContain<T extends keyof CanContain>(
	type: T,
	items: unknown | unknown[]
): items is CanContainType<T>[] {
	items = Array.isArray(items) ? items : [items]
	// @ts-expect-error ok ok
	return (items as string[]).every(item => CanContain[type].includes(item))
}
