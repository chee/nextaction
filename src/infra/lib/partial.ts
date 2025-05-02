export function partial<T, U extends unknown[], R>(
	fn: (arg0: T, ...rest: U) => R,
	fixed: T
): (...rest: U) => R {
	return (...rest: U) => fn(fixed, ...rest)
}
