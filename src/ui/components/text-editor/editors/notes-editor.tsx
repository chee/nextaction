import {
	Decoration,
	EditorView,
	ViewPlugin,
	WidgetType,
	type DecorationSet,
	type KeyBinding,
	type ViewUpdate,
} from "@codemirror/view"
import Editor from "::ui/components/text-editor/text-editor.tsx"
import {EditorState, RangeSetBuilder, type Extension} from "@codemirror/state"
import {Show} from "solid-js"

import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import type {BembyModifier, BembyModifiers} from "bemby"
import {indentWithTab} from "@codemirror/commands"
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"
import {tags} from "@lezer/highlight"
import {syntaxTree} from "@codemirror/language"

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
					markdown({
						base: markdownLanguage,
						addKeymap: true,
					}),
					syntaxHighlighting(wysish),
					bulletPlugin,
					EditorState.allowMultipleSelections.of(true),
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
					indentWithTab,
					...(props.keymap || []),
				]}
				withView={props.withView}
				placeholder={props.placeholder}
			/>
		</Show>
	)
}

const wysish = HighlightStyle.define([
	{
		tag: tags.content,
		fontFamily: "var(--family-sans)",
	},
	{tag: tags.self, fontFamily: "var(--family-sans)"},

	{
		tag: tags.monospace,
		fontFamily: "var(--family-mono)",
	},
	{
		tag: tags.heading1,
		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.heading2,

		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.heading3,

		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.heading4,

		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.heading5,

		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.heading6,
		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.emphasis,
		fontStyle: "italic",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.strong,
		fontWeight: "bold",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.link,
		color: "var(--color-link)",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.strikethrough,
		textDecoration: "line-through",
		fontFamily: "var(--family-sans)",
	},
	{
		tag: tags.quote,
		color: "var(--color-quote)",
		fontFamily: "var(--family-sans)",
	},
])

const bulletPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet
		constructor(public view: EditorView) {
			this.decorations = this.build()
		}
		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged) {
				this.decorations = this.build()
			}
		}
		private build(): DecorationSet {
			const builder = new RangeSetBuilder<Decoration>()
			const doc = this.view.state.doc
			syntaxTree(this.view.state).iterate({
				enter: ({type, from}) => {
					if (type.name === "ListMark") {
						const char = doc.sliceString(from, from + 1)
						if (["-", "+", "*"].includes(char)) {
							builder.add(
								from,
								from + 1,
								Decoration.replace({widget: new BulletWidget()})
							)
						}
					}
				},
			})
			return builder.finish()
		}
	},
	{
		decorations: v => v.decorations,
	}
)

class BulletWidget extends WidgetType {
	toDOM() {
		const span = document.createElement("span")
		span.textContent = "•"
		span.className = "cm-bullet"
		return span
	}
}
