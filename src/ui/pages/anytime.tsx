import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {useAnytimePage} from "../../viewmodel/pages/anytime-page.ts"
import {PageContext} from "../../viewmodel/generic/page.ts"

export default function Anytime() {
	const page = useAnytimePage()

	return (
		<PageContext.Provider value={page}>
			<div class="anytime page-container">
				<Bar>
					<BarNewAction />
					<BarMenu />
				</Bar>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">🌻</div>
						<span class="page-title__title">Anytime</span>
					</h1>
					{/* todo need a new InlineProject component */}
					{/* todo ProjectAndActionList */}
					<main class="page-content">
						<ActionList
							selection={page.selection}
							isSelected={page.selection.isSelected}
							isExpanded={page.isExpanded}
							expand={page.expand}
							collapse={page.collapse}
							actions={page.visibleItems}
						/>
					</main>
				</div>
			</div>
		</PageContext.Provider>
	)
}
