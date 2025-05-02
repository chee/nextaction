import {EditorView, type KeyBinding} from "@codemirror/view"
import Editor from "@/ui/components/editor/editor.tsx"
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
	keymap?: KeyBinding[]
	modifiers?: BembyModifier | BembyModifiers
}) {
	return (
		<Show when={props.syncExtension}>
			<Editor
				modifiers={[props.modifiers, "notes"].flat() as BembyModifiers}
				doc={props.doc}
				extensions={[
					props.syncExtension!,
					markdown({base: markdownLanguage, addKeymap: true}),
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
