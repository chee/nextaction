import "./action.css"
import bemby, {
	type BembyModifier,
	type BembyModifiers,
} from "../../util/bemby.ts"
import {createSignal, Match, Show, Switch} from "solid-js"
import NotesIcon from "::ui/icons/notes.tsx"
import NotesEditor from "::ui/components/text-editor/editors/notes-editor.tsx"
import TitleEditor from "::ui/components/text-editor/editors/title-editor.tsx"
import debug from "debug"
import ActionCheckbox from "../checkbox/action-checkbox.tsx"
const log = debug("nextaction:action")
import useClickOutside from "solid-click-outside"
import {createEffect} from "solid-js"
import {clsx} from "@nberlette/clsx"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {Suspense} from "solid-js"
import type {Action} from "::domain/entities/useAction.ts"
import {useDragAndDrop} from "::domain/dnd/dnd-context.ts"
import type {SelectableProps} from "::domain/state/useSelection.ts"
import type {ExpandableProps} from "::domain/state/useExpander.ts"
import {isToday} from "::shapes/mixins/doable.ts"
import {modshift} from "::ui/util/hotkeys.ts"

export default function ActionItem(
	props: {
		class?: string
		modifiers?: BembyModifiers | BembyModifier
	} & SelectableProps &
		ExpandableProps &
		Action
) {
	const [dismissible, setDismissible] = createSignal<HTMLElement>()
	createEffect(() => {
		if (props.expanded) {
			useClickOutside(dismissible, () => {
				props.collapse()
			})
		}
	})

	const dnd = useDragAndDrop()

	return (
		<Suspense>
			<article
				tabIndex={0}
				ref={element => {
					setDismissible(element)
					dnd.createDraggableListItem(element, () => props.url)
					// todo
					dropTargetForElements({element})
				}}
				class={clsx(
					bemby(
						"action",
						{
							current: props.selected,
							expanded: props.expanded,
							closed: ["canceled", "completed"].includes(props.state),
							today: isToday(props),
							dragged: dnd.active && props.selected,
						},
						props.state,
						...((Array.isArray(props.modifiers)
							? props.modifiers
							: [props.modifiers]) as BembyModifiers)
					),
					props.class
				)}
				role="listitem"
				aria-current={props.selected}
				aria-expanded={props.expanded}
				onKeyDown={event => {
					if (event.key === "Enter") {
						if (!props.expanded) {
							props.expand()
						}
					}
					if (event.key == "˚" && event.metaKey) {
						event.preventDefault()
						props.toggleCanceled()
					}
				}}
				onClick={event => {
					if (event.metaKey) {
						if (props.selected) {
							props.removeSelected()
						} else {
							props.addSelected()
						}
					} else if (event.shiftKey) {
						props.addSelectedRange()
					} else {
						props.select()
					}
				}}
				onDblClick={event => {
					if (modshift(event)) return
					if (!props.expanded) {
						props.expand()
					}
				}}>
				<Show when={log.enabled}>
					<pre class="action__debug">{props.url}</pre>
				</Show>
				<header class="action__header">
					<ActionCheckbox {...props} />
					<time
						class="state-changed state-changed--action"
						dateTime={props.stateChanged?.toISOString()}>
						{
							/* todo today */
							props.stateChanged?.toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})
						}
					</time>
					<h2 id={`${props.url}-title`} class="action__title">
						<Switch>
							<Match when={props.expanded}>
								<TitleEditor
									placeholder="New action"
									doc={props.title}
									blur={() => props.collapse()}
									submit={() => {
										props.collapse()
									}}
									// todo move to end of note when press tab
									// todo move to start of note when press right at end
									// todo move to note when press down
									syncExtension={props.titleSyncExtension}
									withView={view => {
										view.focus()
										view.dispatch({
											selection: {
												head: view.state.doc.length,
												anchor: view.state.doc.length,
											},
										})
										setTimeout(() => {
											view.contentDOM.scrollIntoView({
												behavior: "instant",
												block: "center",
											})
										}, 4)
									}}
								/>
							</Match>
							<Match when={!props.expanded}>{props.title}</Match>
						</Switch>
					</h2>
					{/* todo extract indicators to its own component */}
					<Show when={!props.expanded}>
						<div class="action-indicators">
							<Show when={props.notes}>
								<NotesIcon />
							</Show>
						</div>
					</Show>
				</header>
				<section class="action__editor">
					<article class="action__note">
						<Show when={props.expanded}>
							<NotesEditor
								placeholder="Notes"
								blur={() => props.collapse()}
								doc={props.notes}
								syncExtension={props.notesSyncExtension}
							/>
						</Show>
					</article>
					<footer class="action__expanded-footer" />
				</section>
				<footer class="action__collapsed-footer" />
			</article>
		</Suspense>
	)
}
