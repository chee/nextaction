import "./action.css"
import bemby from "bemby"
import {createSignal, Match, Show, Switch} from "solid-js"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import NotesIcon from "@/ui/icons/notes.tsx"
import NotesEditor from "@/ui/components/editor/notes-editor.tsx"
import TitleEditor from "@/ui/components/editor/title-editor.tsx"
import debug from "debug"
import {modshift} from "@/infra/lib/hotkeys.ts"
import Checkbox from "@/ui/components/actions/checkbox.tsx"
import {isToday} from "../../../domain/generic/doable.ts"
const log = debug("action")
import useClickOutside from "solid-click-outside"
import {createEffect} from "solid-js"
import {clsx} from "@nberlette/clsx"

export default function Action(
	props: {
		selected: boolean
		expanded: boolean
		select(): void
		addSelected(): void
		addSelectedRange(): void
		removeSelected(): void
		expand(): void
		collapse(): void
		ref?(el: HTMLElement): void
		dragged: boolean
		dragtarget: boolean
		droptarget?: "above" | "below"
		class?: string
	} & ActionViewModel
) {
	const [dismissible, setDismissible] = createSignal<HTMLElement>()
	createEffect(() => {
		if (props.expanded) {
			useClickOutside(dismissible, () => {
				props.collapse()
			})
		}
	})

	return (
		<article
			ref={ref => {
				props.ref?.(ref)
				setDismissible(ref)
			}}
			class={clsx(
				bemby(
					"action",
					{
						current: props.selected,
						expanded: props.expanded,
						dragged: props.dragged,
						dragtarget: props.dragtarget,
						droptarget: !!props.droptarget,
						"droptarget-above": props.droptarget === "above",
						"droptarget-below": props.droptarget === "below",
						closed: ["canceled", "completed"].includes(props.state),
						today: isToday(props),
					},
					props.state
				),
				props.class
			)}
			role="listitem"
			aria-current={props.selected}
			aria-expanded={props.expanded}
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
					<NotesEditor
						placeholder="Notes"
						blur={() => props.collapse()}
						doc={props.notes}
						syncExtension={props.notesSyncExtension}
						withView={view => view.contentDOM.scrollIntoView()}
					/>
				</article>
				<footer class="action__footer" />
			</section>
		</article>
	)
}
