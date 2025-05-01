import Bar, {BarButton, BarMenu} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import BigPlus from "@/ui/icons/big-plus.tsx"
import {useHome} from "../../viewmodel/home.ts"
import {createSelectionContext} from "@/infra/hooks/selection-context.ts"
import {createSignal} from "solid-js"

// todo maybe the page context should be passed to the bar
// or maybe the page context should be at the chrome level
export default function Today() {
	const home = useHome()
	// todo separate projects, actions and areas
	// so that the projects and areas can be shown separate
	const todayURLs = () => home.today.map(item => item.url)
	const selection = createSelectionContext(todayURLs)

	// todo share these with inbox somehow
	// perhaps a viewmodel mixin or an expanded context thing
	// with .isExpanded(url) and .expand(url) and .collapse(url)
	const [expanded, setExpanded] = createSignal<string>()

	// todo add typical hotkeys to a hook
	// it can be passed `selection` and `newAction` and expand`
	// specific to the page
	// todo newAction on this page, for instance, force-adds when
	// to be today

	return (
		<div class="anytime">
			<Bar>
				<BarButton
					icon={<BigPlus />}
					label="new action"
					onClick={() => {
						// todo the BigPlus button should be a component
						// it can be passed `selection` and `newAction` and expand`
						// specific to the page
						// todo newAction on this page, for instance, force-adds when
						// to be today
						// const index = page.selection.lastSelectedIndex()
						// const url = page.inbox.newAction(
						// 	{},
						// 	index == -1 ? undefined : index + 1
						// )
						// page.expand(url)
					}}
				/>
				<BarMenu />
			</Bar>
			<div class="page">
				<h1 class="page-title">
					<div class="page-title__icon">🌻</div>
					<span class="page-title__title">Anytime</span>
				</h1>
				{/* todo need a new InlineProject component */}
				<ActionList
					actions={home.today}
					selection={selection}
					isSelected={url => selection.isSelected(url)}
					isExpanded={url => expanded() == url}
					expand={url => setExpanded(url)}
					collapse={_url => setExpanded()}
				/>
			</div>
		</div>
	)
}
