import Bar, {BarMenu, BarNewAction} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {useInboxPage} from "@/viewmodel/pages/inbox-page.ts"
import {useHotkeys} from "@/infra/lib/hotkeys.ts"
import type {ActionURL} from "@/domain/action.ts"
import {useAction} from "@/viewmodel/action.ts"

import {runWithOwner, getOwner} from "solid-js"
import {PageContext} from "../../viewmodel/generic/page.ts"

export default function Inbox() {
	const page = useInboxPage()
	const topSelectedItemIndex = () =>
		Math.max(
			Math.min(
				...page.selection
					.selected()
					// todo visible items only
					.map(url => page.visibleItemURLs.indexOf(url as ActionURL))
			),
			0
		)

	function createNewAction() {
		const url = page.newAction(page.selection.lastSelectedIndex() + 1)
		page.selection.select(url)
		setTimeout(() => {
			page.expand(url)
		})
		return url
	}

	useHotkeys("up", () => {
		const index = page.selection.lastSelectedIndex()
		if (index > 0) {
			page.selection.select(page.visibleItems[index - 1].url)
		} else {
			page.selection.select(page.visibleItems[0].url)
		}
	})

	useHotkeys("cmd+up", () => {
		page.inbox.moveAction(
			page.selection.selected() as ActionURL[],
			topSelectedItemIndex() - 1
		)
	})
	useHotkeys("shift+up", () => {
		const action = page.visibleItems[topSelectedItemIndex() - 1]
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		action && page.selection.addSelected(action.url)
	})

	useHotkeys("down", () => {
		const index = page.selection.lastSelectedIndex()
		const len = page.inbox.actions.length
		if (index < len - 1) {
			page.selection.select(page.inbox.actions[index + 1].url)
		}
	})

	useHotkeys("cmd+down", () => {
		page.inbox.moveAction(
			page.selection.selected() as ActionURL[],
			topSelectedItemIndex() + 1
		)
	})

	useHotkeys("shift+down", () => {
		const action = page.visibleItems[topSelectedItemIndex() + 1]
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		action && page.selection.addSelected(action.url)
	})

	useHotkeys("backspace", () => {
		const index = page.selection.lastSelectedIndex()
		page.inbox.removeAction(page.selection.selected() as ActionURL[])
		page.selection.select(page.visibleItems[index]?.url)
	})

	useHotkeys("space", () => createNewAction())
	useHotkeys("enter", () =>
		page.expand(page.selection.selected()[0] as ActionURL)
	)

	const owner = getOwner()
	useHotkeys(
		"cmd+k",
		() => {
			runWithOwner(owner, () => {
				const actions = page.selection
					.selected()
					.map(url => useAction(() => url as ActionURL))
				const completed = actions.filter(action => action?.state == "completed")
				const anyComplete = completed.length > 0
				const allComplete = completed.length === actions.length
				let force: boolean | undefined = undefined
				if (anyComplete && !allComplete) {
					force = true
				}

				for (const url of page.selection.selected()) {
					useAction(() => url as ActionURL).toggleCompleted(force)
				}
			})
		},
		{preventDefault: () => true}
	)
	useHotkeys(
		"cmd+alt+k",
		() => {
			runWithOwner(owner, () => {
				const actions = page.selection
					.selected()
					.map(url => useAction(() => url as ActionURL))
				const canceled = actions.filter(action => action?.state == "canceled")
				const anyCanceled = canceled.length > 0
				const allCanceled = canceled.length === actions.length
				let force: boolean | undefined = undefined
				if (anyCanceled && !allCanceled) {
					force = true
				}

				for (const url of page.selection.selected()) {
					useAction(() => url as ActionURL).toggleCanceled(force)
				}
			})
		},
		{preventDefault: () => true}
	)

	return (
		<PageContext.Provider value={page}>
			<div class="inbox page-container">
				<Bar>
					<BarNewAction />
					<BarMenu />
				</Bar>

				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">📥</div>
						<span class="page-title__title">Inbox</span>
					</h1>
					<main class="page-content">
						<ActionList
							selection={page.selection}
							expand={page.expand}
							collapse={page.collapse}
							isSelected={page.selection.isSelected}
							isExpanded={page.isExpanded}
							actions={page.visibleItems}
						/>
					</main>
				</div>
			</div>
		</PageContext.Provider>
	)
}
