import {
	drawSelection,
	EditorView,
	type KeyBinding,
	keymap,
	placeholder,
} from "@codemirror/view"
import { type Extension } from "@codemirror/state"
import { onMount } from "solid-js"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"

export default function Editor(props: {
	doc: string
	extensions: Extension
	withView?(view: EditorView): void
	keymap?: KeyBinding[]
	placeholder?: string
}) {
	const editor = <div style={{ width: "100%" }} /> as HTMLDivElement

	const view = new EditorView({
		parent: editor,
		doc: props.doc,
		extensions: [
			history(),
			drawSelection(),
			placeholder(props.placeholder || ""),
			EditorView.theme(theme),
			keymap.of(
				(props.keymap || []).concat(defaultKeymap).concat(historyKeymap),
			),
			EditorView.lineWrapping,
			props.extensions,
		],
	})

	onMount(() => props.withView?.(view))
	editor.addEventListener(
		"keydown",
		(event) => event.stopImmediatePropagation(),
	)
	return editor
}

// todo make theme be based on the css props
export const theme = {
	"*": {
		"font-family": "var(--family-sans)",
		"font-size": "inherit",
	},
	"&.cm-focused": {
		outline: "none",
	},
	"&.cm-editor .cm-cursor": {
		"border-left-color": "#6C9BEE",
		"border-left-width": "2px",
	},
	"&.cm-editor": {
		width: "100%",
	},
	"&.cm-editor .cm-line": {
		padding: 0,
	},
	"&.cm-focused .cm-selectionLayer .cm-selectionBackground.cm-selectionBackground.cm-selectionBackground.cm-selectionBackground.cm-selectionBackground":
		{
			background: "#6C9BEE",
			opacity: 0.5,
		},
}
