import {onCleanup} from "solid-js"
import {useKeyDownEvent} from "@solid-primitives/keyboard"
import {createEffect} from "solid-js"

const keymap = {
	cmd: "command",
	super: "command",
	meta: "command",
	ctrl: "control",
	alt: "option",

	dot: ".",
	period: ".",
	comma: ",",
	slash: "/",
	backslash: "\\",
	space: " ",
	backtick: "`",
	backquote: "`",
	hash: "#",
	plus: "+",
	minus: "-",
	equals: "=",
	equal: "=",
	return: "enter",

	up: "arrowup",
	down: "arrowdown",
	left: "arrowleft",
	right: "arrowright",
}

enum mod {
	shift = 1,
	control = 2,
	option = 3,
	command = 4,
}

function modshift(event: KeyboardEvent) {
	let bits = 0
	bits |= +event.shiftKey << mod.shift
	bits |= +event.ctrlKey << mod.control
	bits |= +event.altKey << mod.option
	bits |= +event.metaKey << mod.command
	return bits
}

interface Options {
	/**
	 * prevent browser default?
	 * @default true
	 */
	preventDefault?(): boolean
}

// todo delegate to context?
/**
 * @param keybinding the hotkey to bind e.g. command+backslash
 * @param action
 * @param options
 * @returns disposer
 */
export function useHotkeys(
	keybinding: string,
	action: (...args: unknown[]) => void,
	options?: Options
) {
	const eventSignal = useKeyDownEvent()
	const shouldPreventDefault = () => options?.preventDefault?.() ?? true
	const binding = parse(keybinding)

	createEffect(() => {
		const event = eventSignal()
		if (!event) return

		const bits = modshift(event)

		if (bits == binding.mask && event.key.toLowerCase() == binding.key) {
			if (shouldPreventDefault()) {
				event.preventDefault()
			}
			action()
		}
	})
}

function parse(keybinding: string) {
	const parts = keybinding.split("+").map(part => {
		part = part.trim().replace(/^(digit|arrow|key|numpad)/, "")
		return keymap[part as keyof typeof keymap] ?? part
	})

	const key = parts.pop()!.toLowerCase()

	const mask = parts.reduce(
		(bits, part) => bits | (1 << mod[part as keyof typeof mod]),
		0
	)

	return {key, mask}
}
