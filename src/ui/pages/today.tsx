import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {useTodayPage} from "../../viewmodel/pages/today-page.ts"
import {PageContext} from "../../viewmodel/generic/page.ts"
import type {ActionViewModel} from "../../viewmodel/action.ts"

// todo maybe the page context should be passed to the bar
// or maybe the page context should be at the chrome level
export default function Today() {
	const page = useTodayPage()
	// todo add typical hotkeys to a hook
	// it can be passed `selection` and `newAction` and expand`
	// specific to the page

	return (
		<PageContext.Provider value={page}>
			<div class="today page-container">
				<Bar>
					<BarNewAction />
					<BarMenu />
				</Bar>
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">✨</div>
						<span class="page-title__title">Today</span>
					</h1>
					{/* todo handle projects in today */}
					<main class="page-content">
						<ActionList
							actions={page.visibleItems}
							selection={page.selection}
							isSelected={page.selection.isSelected}
							isExpanded={page.isExpanded}
							expand={page.expand}
							collapse={page.collapse}
						/>
					</main>
				</div>
			</div>
		</PageContext.Provider>
	)
}
