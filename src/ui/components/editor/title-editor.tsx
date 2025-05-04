import {EditorView, type KeyBinding} from "@codemirror/view"
import {EditorState, type Extension} from "@codemirror/state"
import {Show} from "solid-js"
import Editor from "@/ui/components/editor/editor.tsx"
import type {BembyModifiers, BembyModifier} from "bemby"

export default function TitleEditor(props: {
	doc: string
	blur(): void
	submit(): void
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
				readonly={props.readonly}
				modifiers={
					[
						props.modifiers,
						"title",
						props.readonly?.() && "readonly",
					].flat() as BembyModifiers
				}
				withView={props.withView}
				doc={props.doc}
				extensions={[
					EditorState.transactionFilter.of(tr =>
						tr.newDoc.lines > 1 ? [] : tr
					),
					...(props.extensions || []),
				]}
				syncExtension={props.syncExtension!}
				keymap={[
					{
						key: "Escape",
						run(view: EditorView) {
							view.contentDOM.blur()
							props.blur()
							return true
						},
					},
					{
						key: "Enter",
						run(view: EditorView) {
							view.contentDOM.blur()
							props.blur()
							props.submit()
							return true
						},
					},
					...(props.keymap || []),
				]}
				placeholder={props.placeholder}
			/>
		</Show>
	)
}
