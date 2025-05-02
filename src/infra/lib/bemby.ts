import {clsx} from "@nberlette/clsx"
import type {ClassValue} from "@nberlette/clsx"

export type BembyModifier = string | boolean | Record<string, boolean>
export type BembyModifiers = BembyModifier[]

/**
 * BEM helper function to generate class names based on the BEM methodology.
 *
 * @param block - The base block name.
 * @param modifiers - Additional modifiers or boolean flags to apply.
 * @returns A string of class names based on the provided block and modifiers.
 *
 * @example
 * ```ts
 * bemby("button", "primary", { disabled: true })
 * // returns "button button--primary button--disabled"
 * ```
 */
export default function bemby(
	block: string,
	first?: BembyModifier | BembyModifiers,
	...modifiers: BembyModifiers
): string {
	return clsx(
		block,
		[first, ...modifiers].map(function handle(modifier): ClassValue {
			if (typeof modifier === "string") {
				return `${block}--${modifier}`
			} else if (Array.isArray(modifier)) {
				return modifier.map(handle)
			} else if (typeof modifier === "object") {
				return Object.entries(modifier).map(([key, value]) => {
					if (value) {
						return `${block}--${key}`
					}
					return false
				})
			}
		})
	)
}
