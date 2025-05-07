import mergeDescriptors from "merge-descriptors"

type Mix<T extends object[]> = T extends [infer First, ...infer Rest]
	? First & Mix<Extract<Rest, object[]>>
	: unknown

export default function mix<T extends object[]>(...objects: T): Mix<T> {
	return objects.reduce((acc, obj) => {
		mergeDescriptors(acc, obj, true)
		return acc
	}) as Mix<T>
}
