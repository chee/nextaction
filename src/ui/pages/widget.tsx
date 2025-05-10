import "./widget.css"
import "../components/checkbox/action-checkbox.css"
import {useUser} from "::domain/useUser.ts"
import {For} from "solid-js"
import {icons} from "../styles/themes/themes.ts"
import {isDoable, isOpen, isToday} from "::shapes/mixins/doable.ts"
import bemby from "bemby"
import {createSignal} from "solid-js"
import {createEffect} from "solid-js"
import {ProgressPie} from "../components/projects/project-item.tsx"

export default function WidgetPage() {
	const user = useUser()
	const [state, setState] = createSignal(0)
	setTimeout(() => {
		setState(true)
	}, 500)

	// todo investigate loss of reacitivity on .items and then bring back use cache
	createEffect(() => {
		user.home.list.items
		setState(n => n + 1)
	})
	return (
		<a class="widget" href="/today">
			<h2>{icons.today} Today</h2>
			<ul>
				<For each={state() ? user.home.list.flat : []}>
					{item => {
						if (
							isDoable(item) &&
							isToday(item) &&
							isOpen(item) &&
							!item.deleted &&
							item.title
						) {
							return (
								<li>
									<Show
										when={item.type == "project"}
										fallback={<div class={bemby("checkbox")}></div>}>
										<ProgressPie progress={item.progress} />
										<div class="icon">{item.icon}</div>
									</Show>
									{item.title}
								</li>
							)
						}
					}}
				</For>
			</ul>
		</a>
	)
}
