import {EditorView, type KeyBinding} from "@codemirror/view"
import Editor from "@/ui/components/text-editor/text-editor.tsx"
import type {Extension} from "@codemirror/state"
import {Show} from "solid-js"

import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import type {BembyModifier, BembyModifiers} from "bemby"

export default function NotesEditor(props: {
	doc: string
	blur(): void
	placeholder?: string
	withView?(view: EditorView): void
	syncExtension?: Extension
	extensions?: Extension[]
	keymap?: KeyBinding[]
	modifiers?: BembyModifier | BembyModifiers
	readonly?(): boolean
}) {
	return (
		<Show when={props.syncExtension}>
			<Editor
				modifiers={[props.modifiers, "notes"].flat() as BembyModifiers}
				doc={props.doc}
				syncExtension={props.syncExtension!}
				extensions={[
					markdown({base: markdownLanguage, addKeymap: true}),
					...(props.extensions || []),
				]}
				keymap={[
					{
						key: "Escape",
						run(view) {
							view.contentDOM.blur()
							props.blur()
							return true
						},
					},
					...(props.keymap || []),
				]}
				withView={props.withView}
				placeholder={props.placeholder}
			/>
		</Show>
	)
}
