import "./text-editor.css"
import {
	drawSelection,
	EditorView,
	type KeyBinding,
	keymap,
	placeholder,
} from "@codemirror/view"
import {Compartment, EditorState, type Extension} from "@codemirror/state"
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
import type {BembyModifiers} from "bemby"
import bemby from "bemby"
import {createEffect, untrack} from "solid-js"
import {onMount} from "solid-js"

export default function Editor(props: {
	doc: string
	withView?(view: EditorView): void
	keymap?: KeyBinding[]
	placeholder?: string
	modifiers?: BembyModifiers
	extensions?: Extension[]
	readonly?(): boolean
	syncExtension: Extension
}) {
	if (!props.syncExtension) {
		return null
	}
	if (!props.doc) {
		console.log(props.doc)
	}
	const editor = (
		<div
			class={bemby(
				"text-editor",
				props.modifiers,
				props.readonly?.() ? "readonly" : ""
			)}
			style={{width: "100%"}}
		/>
	) as HTMLDivElement

	const sync = new Compartment()
	const readonly = new Compartment()
	const keymapCompartment = new Compartment()
	const themeCompartment = new Compartment()
	const placeholderCompartment = new Compartment()
	const editable = new Compartment()
	const isReadonly = () => props.readonly?.() || false
	const isEditable = () => !isReadonly()

	const makeKeymap = () =>
		(props.keymap || []).concat(defaultKeymap).concat(historyKeymap)

	const makeExtensions = () => [
		history(),
		drawSelection(),

		placeholderCompartment.of(placeholder(props.placeholder || "")),
		themeCompartment.of(EditorView.theme(theme)),
		keymapCompartment.of(keymap.of(makeKeymap())),

		EditorView.contentAttributes.of({
			autocorrect: "true",
			spellcheck: "true",
			autocapitalize: "true",
		}),

		readonly.of(EditorState.readOnly.of(isReadonly())),
		editable.of(EditorView.editable.of(isEditable())),
		EditorView.lineWrapping,

		sync.of(props.syncExtension),
		...[props.extensions ?? []],
	]

	const view: EditorView = new EditorView({
		parent: editor,
		// eslint-disable-next-line solid/reactivity
		doc: props.doc,
		// eslint-disable-next-line solid/reactivity
		extensions: makeExtensions(),
	})

	createEffect(() => {
		const doc = untrack(() => props.doc)
		view.dispatch({
			effects: sync.reconfigure(props.syncExtension),
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: doc,
			},
		})
	})

	createEffect(() => {
		view.dispatch({
			effects: [
				readonly.reconfigure(EditorState.readOnly.of(isReadonly())),
				editable.reconfigure(EditorView.editable.of(isEditable())),
			],
		})
	})

	createEffect(() => {
		view.dispatch({
			effects: keymapCompartment.reconfigure(keymap.of(makeKeymap())),
		})
	})

	createEffect(() => {
		view.dispatch({
			effects: themeCompartment.reconfigure(EditorView.theme(theme)),
		})
	})

	createEffect(() => {
		view.dispatch({
			effects: placeholderCompartment.reconfigure(
				placeholder(props.placeholder || "")
			),
		})
	})

	onMount(() => props.withView?.(view))

	editor.addEventListener("keydown", event => event.stopImmediatePropagation())
	return editor
}

// todo make theme be based on the css props
export const theme = {
	"*": {
		"font-family": "var(--family-sans)",
		"font-size": "inherit",
		color: "var(--text-editor-text-color)",
	},
	".cm-placeholder": {
		color: "var(--text-editor-placeholder-color)",
	},
	"&.cm-focused": {
		outline: "none",
	},
	"&.cm-editor .cm-cursor": {
		"border-left-color": `var(--caret-color)`,
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
			background: `var(--caret-color)`,
			opacity: 0.5,
		},
}
