// import Bar, {BarMenu, BarNewAction} from "../../components/bar/bar.tsx"
import ActionList from "::ui/components/actions/action-list.tsx"
import {useHotkeys} from "::infra/lib/hotkeys.ts"
import {newAction, type ActionRef, type ActionURL} from "::domain/action.ts"
import {type SelectionContext} from "::infra/hooks/selection-context.ts"
import {useHomeContext} from "::viewmodel/home.ts"
import {usePageContext} from "::viewmodel/helpers/page.ts"
import {isClosed} from "::domain/generic/doable.ts"
import {useAction, type ActionViewModel} from "::viewmodel/action.ts"
import {onCleanup} from "solid-js"
import {createShortcut} from "@solid-primitives/keyboard"
import {DragAndDropProvider} from "../../../infra/dnd/dnd-context.ts"
import {curl} from "../../../infra/sync/automerge-repo.ts"
import {dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import {
	getDraggedPayload,
	getDropTargetIndex,
	getInput,
} from "::infra/dnd/contract.ts"

// inbox is special because it has its own list
export default function Inbox() {
	const home = useHomeContext()

	const page = usePageContext({
		items: () => home.inbox.items,
		selectableItemFilter: item =>
			(!("deleted" in item) || !item.deleted) &&
			(!("state" in item) || !isClosed(item)),
	})

	page.commandRegistry.setCommands({
		"new-action": {
			id: "new-action",
			label: "New action",
			shortcut: "space",
			exe: () => {
				// todo so much of this needs wrapped into a command
				// list.
				// url = page.expander.expand(home.inbox.newItem("action",
				// template))
				// and then
				// return page.newItemCommand("action", template)
				const newActionURL = curl<ActionURL>(newAction())
				const selected = page.selection.lastSelected()
				const selref = home.inbox.keyed[selected]?.asReference() as
					| ActionRef
					| undefined
				home.inbox.addItem("action", newActionURL, selref)
				page.expander.expand(newActionURL)
				return {
					undo() {
						home.inbox.removeItem("action", newActionURL)
					},
					redo() {
						home.inbox.addItem("action", newActionURL, selref)
					},
				}
			},
		},
		delete: {
			id: "delete",
			label: "Delete item",
			shortcut: "backspace",
			exe() {
				const selected = page.selection.selected()
				const bottom = page.selection.bottomSelectedIndex()
				for (const url of selected) {
					home.inbox.keyed[url]?.delete()
				}
				page.selection.select(
					page.selectableItemURLs()[bottom] ??
						page.selectableItemURLs()[bottom - 1] ??
						page.selectableItemURLs()[bottom + 1] ??
						page.selectableItemURLs()[page.selectableItemURLs().length - 1]
				)
				return {
					undo() {
						for (const url of selected) {
							home.inbox.addItem("action", url as ActionURL)
						}
					},
					redo() {
						for (const url of selected) {
							home.inbox.removeItem("action", url as ActionURL)
						}
					},
				}
			},
		},
	})

	useSelectionHotkeys(page)

	return (
		<DragAndDropProvider value={page.dnd}>
			<div
				ref={element => {
					const clean = dropTargetForElements({
						element,
						onDrop(payload) {
							const input = getInput(payload)
							const dragged = getDraggedPayload(payload)
							if (!dragged) return

							const {isAbove, dropTargetURL} = getDropTargetIndex({
								element: element,
								input,
								items: page.selectableItemURLs,
								dragged,
								isValidDropTarget() {
									// there's only actions in here
									return true
								},
							})

							const urls = dragged.items.map(i => i.url)

							if (isAbove) {
								home.inbox.moveItemBefore(
									"action",
									urls as ActionURL[],
									dropTargetURL
								)
							} else {
								home.inbox.moveItemAfter(
									"action",
									urls as ActionURL[],
									dropTargetURL
								)
							}
						},
						onDrag(payload) {
							const dragged = getDraggedPayload(payload)
							const input = getInput(payload)
							if (!dragged) return
							const {dropTargetElement, isAbove} = getDropTargetIndex({
								element: element,
								input,
								items: page.selectableItemURLs,
								dragged,
								isValidDropTarget() {
									return true
								},
							})
							if (dropTargetElement) {
								dropTargetElement.dataset.droptarget = isAbove
									? "above"
									: "below"
							}
						},
					})
					onCleanup(clean)
				}}
				class="inbox page-container page-container--built-in">
				<div class="page">
					<h1 class="page-title">
						<div class="page-title__icon">📥</div>
						<span class="page-title__title">Inbox</span>
					</h1>
					<main class="page-content">
						<ActionList
							selection={page.selection}
							{...page.expander}
							isSelected={page.selection.isSelected}
							actions={home.inbox.items.filter(page.filter)}
							toggleCanceled={(item, force) =>
								page.stage(() => item.toggleCanceled(force), item.url)
							}
							toggleCompleted={(i, f) =>
								page.stage(() => i.toggleCanceled(f), i.url)
							}
						/>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}

// export function useBackspaceDeleteHotkey<T extends string = string>(props: {
// 	selectableItemURLs(): T[]
// 	selection: SelectionContext<T>
// }) {
// 	useHotkeys("backspace", () => {
// 		const index = props.selection.lastSelectedIndex()
// 		const selected = props.selection.selected()
// 		for (const url of selected) {
// 			const item = props.selectableItemURLs().find(item => item == url)
// 			if (item) {
// 				// todo
// 				repo.find(item).then(doc => doc.change(item => item.deleted = true))

// 			}
// 		}
// 		props.selection.select(
// 			props.visibleItems[index]?.url ??
// 				props.visibleItems[props.visibleItems.length - 1]?.url
// 		)
// 	})
// }

export function useSpaceNewActionHotkey<T extends string = string>(props: {
	selection: SelectionContext<T>
	newActionAfter: (url: T) => ActionURL
	expand: (url: ActionURL) => void
}) {
	useHotkeys("space", () => {
		const lastSelected = props.selection.lastSelected()
		const url = props.newActionAfter(lastSelected)
		props.expand(url)
	})
}

export function useSelectionHotkeys<T extends string = string>(props: {
	selectableItemURLs(): T[]
	selection: SelectionContext<T>
}) {
	useHotkeys("up", () => {
		const index = props.selection.lastSelectedIndex()
		if (index > 0) {
			props.selection.select(props.selectableItemURLs()[index - 1])
		} else {
			props.selection.select(props.selectableItemURLs()[0])
		}
	})

	useHotkeys("cmd+a", () => {
		props.selection.selectAll()
	})

	useHotkeys("shift+up", () => {
		const action =
			props.selectableItemURLs()[props.selection.topSelectedIndex() - 1]
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		action && props.selection.addSelected(action)
	})

	useHotkeys("down", () => {
		const index = props.selection.lastSelectedIndex()
		const len = props.selectableItemURLs().length
		if (index < len - 1) {
			props.selection.select(props.selectableItemURLs()[index + 1])
		}
	})

	useHotkeys("shift+down", () => {
		const action =
			props.selectableItemURLs()[props.selection.bottomSelectedIndex() + 1]
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		action && props.selection.addSelected(action)
	})
}

export function useCompleteHotkeys(props: {
	actions(): ActionViewModel[]
	selection: SelectionContext<ActionURL>
	toggleItemCompleted: (item: ActionViewModel, force?: boolean) => void
	toggleItemCanceled: (item: ActionViewModel, force?: boolean) => void
}) {
	// todo move the non-keybinding part of this to the viewmodel
	useHotkeys(
		"cmd+k",
		() => {
			const actions = props.selection
				.selected()
				.map(url => useAction(() => url as ActionURL))
			const completed = actions.filter(action => action?.state == "completed")
			const anyComplete = completed.length > 0
			const allComplete = completed.length === actions.length
			let force: boolean | undefined = undefined
			if (anyComplete && !allComplete) {
				force = true
			}

			for (const url of props.selection.selected()) {
				props.toggleItemCompleted(
					props.actions().find(item => item.url == url)!,
					force
				)
			}
		},
		{preventDefault: () => true}
	)

	createShortcut(
		["Meta", "Alt", "K"],
		() => {
			const actions = props.selection
				.selected()
				.map(url => useAction(() => url as ActionURL))
			const canceled = actions.filter(action => action?.state == "canceled")
			const anyCanceled = canceled.length > 0
			const allCanceled = canceled.length === actions.length
			let force: boolean | undefined = undefined
			if (anyCanceled && !allCanceled) {
				force = true
			}

			for (const url of props.selection.selected()) {
				props.toggleItemCanceled(
					props.actions().find(item => item.url == url)!,
					force
				)
			}
		},
		{preventDefault: true}
	)
}
