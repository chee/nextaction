import { EditorView, type KeyBinding } from "@codemirror/view"
import { EditorState, type Extension } from "@codemirror/state"
import { Show } from "solid-js"
import Editor from "@/ui/components/editor/editor.tsx"

export default function TitleEditor(props: {
	doc: string
	blur(): void
	submit(): void
	placeholder?: string
	withView?(view: EditorView): void
	syncExtension?: Extension
	keymap?: KeyBinding[]
}) {
	return (
		<Show when={props.syncExtension}>
			<Editor
				withView={props.withView}
				doc={props.doc}
				extensions={[
					EditorState.transactionFilter.of((tr) =>
						tr.newDoc.lines > 1 ? [] : tr
					),
					props.syncExtension!,
				]}
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
							console.log("submit")
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
