import {For} from "solid-js"
import "./development-note.css"
export default function DevelopmentNote(props: {problems: string | string[]}) {
	const problems = () =>
		Array.isArray(props.problems) ? props.problems : [props.problems]
	return (
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
		</aside>
	)
}
