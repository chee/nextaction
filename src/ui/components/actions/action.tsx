import "./action.css"
import bemby from "bemby"
import {Match, Show, Suspense, Switch} from "solid-js"
import {Checkbox} from "@kobalte/core/checkbox"
import {type ActionViewModel} from "@/viewmodel/action.ts"
import NotesIcon from "@/ui/icons/notes.tsx"
import NotesEditor from "@/ui/components/editor/notes-editor.tsx"
import TitleEditor from "@/ui/components/editor/title-editor.tsx"
export default function Action(
	props: {
		selected: boolean
		expanded: boolean
		select(): void
		addSelected(): void
		addSelectedRange(): void
		expand(): void
		collapse(): void
		toggle(): void
		move(to: number): void
		ref?(el: HTMLElement): void
		dragged: boolean
	} & ActionViewModel
) {
	return (
		<Suspense>
			<article
				ref={props.ref}
				class={bemby("action", {
					current: props.selected,
					expanded: props.expanded,
					dragged: props.dragged,
				})}
				role="listitem"
				aria-current={props.selected}
				aria-expanded={props.expanded}
				onClick={event => {
					if (event.metaKey) {
						props.addSelected()
					} else if (event.shiftKey) {
						props.addSelectedRange()
					} else {
						props.select()
					}
				}}
				// onClick={event => {
				// 	props.selected || props.select()
				// }}
				onDblClick={() => {
					if (!props.expanded) {
						props.expand()
					}
				}}>
				<header class="action__header">
					<Checkbox
						class="checkbox"
						aria-describedby={`${props.url}-title`}
						checked={!!props.done}
						onClick={event => {
							event.stopPropagation()
							event.preventDefault()
						}}
						onChange={() => {
							props.toggle()
						}}>
						<Checkbox.Input class="checkbox__input" />
						<Checkbox.Control class="checkbox__control">
							<Checkbox.Indicator>
								<svg
									class="checkbox__indicator"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round">
									<path d="M20 6L9 17l-5-5" />
								</svg>
							</Checkbox.Indicator>
						</Checkbox.Control>
					</Checkbox>

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
		</Suspense>
	)
}
