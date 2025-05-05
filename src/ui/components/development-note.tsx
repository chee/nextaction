import {For, Show} from "solid-js"
import "./development-note.css"
import {makePersisted} from "@solid-primitives/storage"
import {createSignal} from "solid-js"
import {Button} from "@kobalte/core/button"

// eslint-disable-next-line solid/reactivity
const [hidden, setHidden] = makePersisted(createSignal(false))

export default function DevelopmentNote(props: {problems: string | string[]}) {
	const problems = () =>
		Array.isArray(props.problems) ? props.problems : [props.problems]
	return (
		<Show when={!hidden()}>
			<aside class="development-note">
				<div class="development-note__content">
					<h3 class="development-note__title">
						<span class="development-note__emoji">
							<img src="/under_construction.gif" alt="⚠️🚧" />
						</span>
						Website under construction.
					</h3>

					<p>
						While some of the features work well, others are still in progress.
					</p>
					<p>Notable in this context:</p>

					<ul>
						<For each={problems()}>
							{problem => (
								<li>
									<p>{problem}</p>
								</li>
							)}
						</For>
					</ul>
				</div>

				<Button
					class="button development-note__close"
					onClick={() => setHidden(true)}>
					hide these messages
				</Button>
			</aside>
		</Show>
	)
}
