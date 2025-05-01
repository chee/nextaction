import Bar, {BarButton, BarMenu} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import BigPlus from "@/ui/icons/big-plus.tsx"
import {useTodayPage} from "../../viewmodel/pages/today-page.ts"
import {PageContext} from "../../viewmodel/generic/page.ts"

// todo maybe the page context should be passed to the bar
// or maybe the page context should be at the chrome level
export default function Today() {
	const page = useTodayPage()
	// todo add typical hotkeys to a hook
	// it can be passed `selection` and `newAction` and expand`
	// specific to the page
	// todo newAction on this page, for instance, force-adds when
	// to be today

	return (
		<PageContext.Provider value={page}>
			<div class="today">
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
						<div class="page-title__icon">✨</div>
						<span class="page-title__title">Today</span>
					</h1>
					<ActionList
						actions={page.today}
						selection={page.selection}
						isSelected={page.selection.isSelected}
						isExpanded={page.isExpanded}
						expand={page.expand}
						collapse={page.collapse}
					/>
				</div>
			</div>
		</PageContext.Provider>
	)
}
