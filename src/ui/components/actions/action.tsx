import "./action.css"
import bemby, {type BembyModifier, type BembyModifiers} from "bemby"
import {createSignal, Match, Show, Switch} from "solid-js"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import NotesIcon from "@/ui/icons/notes.tsx"
import NotesEditor from "@/ui/components/editor/notes-editor.tsx"
import TitleEditor from "@/ui/components/editor/title-editor.tsx"
import debug from "debug"
import {modshift} from "@/infra/lib/hotkeys.ts"
import Checkbox from "@/ui/components/actions/checkbox.tsx"
import {isToday} from "@/domain/generic/doable.ts"
const log = debug("taskpad:action")
import useClickOutside from "solid-click-outside"
import {createEffect} from "solid-js"
import {clsx} from "@nberlette/clsx"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {useDragAndDrop} from "@/infra/dnd/dnd-context.ts"

// todo move to generic types
export type SelectableProps = {
	selected: boolean
	select(): void
	addSelected(): void
	addSelectedRange(): void
	removeSelected(): void
}

export type ExpandableProps = {
	expanded: boolean
	expand(): void
	collapse(): void
}

export default function Action(
	props: {
		class?: string
		modifiers?: BembyModifiers | BembyModifier
	} & SelectableProps &
		ExpandableProps &
		ActionViewModel
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
						event.preventDefault()
						event.stopPropagation()
						event.stopImmediatePropagation()
					} else {
						props.addSelected()
						event.preventDefault()
						event.stopPropagation()
						event.stopImmediatePropagation()
					}
				} else if (event.shiftKey) {
					props.addSelectedRange()
					event.preventDefault()
					event.stopPropagation()
					event.stopImmediatePropagation()
				} else {
					props.select()
					event.preventDefault()
					event.stopPropagation()
					event.stopImmediatePropagation()
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
				<Checkbox {...props} />
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
							withView={view =>
								view.contentDOM.scrollIntoView({
									behavior: "smooth",
								})
							}
						/>
					</Show>
				</article>
				<footer class="action__expanded-footer" />
			</section>
			<footer class="action__collapsed-footer" />
		</article>
	)
}
