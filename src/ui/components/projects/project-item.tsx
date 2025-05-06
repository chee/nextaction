import "./project-item.css"
import {clsx} from "@nberlette/clsx"
import {useNavigate} from "@solidjs/router"
import {Show} from "solid-js"
import {isClosed, isToday} from "::domain/generic/doable.ts"
import bemby, {type BembyModifiers, type BembyModifier} from "bemby"
import type {ProjectViewModel} from "::viewmodel/project.ts"
import NotesIcon from "::ui/icons/notes.tsx"
import {useProjectProgress} from "./use-project-progress.ts"
import type {SelectableProps} from "../actions/action.tsx"
import {useDragAndDrop} from "::infra/dnd/dnd-context.ts"

export function ProgressPie(props: {progress: number}) {
	return <div class="progress-pie" style={{"--progress": props.progress}} />
}

export function ProjectItem(
	props: {
		modifiers?: BembyModifiers | BembyModifier
	} & ProjectViewModel &
		SelectableProps
) {
	const [progress, numberOfOpenItems] = useProjectProgress(() => props.url)
	const nav = useNavigate()
	const dnd = useDragAndDrop()
	return (
		<article
			class={clsx(
				bemby(
					"project-item",
					props.modifiers,
					{
						current: props.selected,
						closed: isClosed(props),
						today: isToday(props),
					},
					props.state
				)
			)}
			ref={element => {
				dnd.createDraggableListItem(element, () => props.url)
			}}
			role="listitem"
			aria-current={props.selected}
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
			onDblClick={() => {
				nav(`/projects/${props.url}`)
			}}>
			<header class="project-item__header">
				{/* todo debug & magic project checkbox */}
				{/* <Checkbox {...props} /> */}
				<span class="project-item__progress">
					<ProgressPie progress={progress()} />
				</span>
				<h3 id={`${props.url}-title`} class="project-item__title">
					<span class="project-item__title-icon">{props.icon}</span>
					<Show
						when={props.title}
						fallback={
							<span class="project-item__title-placeholder">New project</span>
						}>
						<span class="project-item__title-text">{props.title}</span>
					</Show>
				</h3>
				<div class="project-item__indicators">
					<span
						class="project-item__count"
						aria-label={`Number of open items: ${numberOfOpenItems()}`}>
						{numberOfOpenItems()}
					</span>
					<Show when={props.notes.trim()}>
						<NotesIcon />
					</Show>
				</div>
			</header>
			<footer class="project-item__footer" />
		</article>
	)
}
