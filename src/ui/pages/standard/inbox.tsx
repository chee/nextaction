import ActionList from "::ui/components/actions/action-list.tsx"
import {isClosed} from "::shapes/mixins/doable.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {usePageContext} from "::viewmodels/common/page.ts"
import {DragAndDropProvider} from "::viewmodels/dnd/dnd-context.ts"
import {useCommandRegistry} from "::viewmodels/commands/commands.tsx"
import {
	createCancelCommand,
	createCompleteCommand,
	createDeleteCommand,
	createNewActionCommand,
} from "::viewmodels/commands/standard.ts"

// inbox is special because it has its own list
export default function InboxView() {
	const home = useHomeContext()

	const page = usePageContext({
		items: () => home().inbox.items,
		selectableItemFilter: item =>
			(!("deleted" in item) || !item.deleted) &&
			(!("state" in item) || !isClosed(item)),
	})

	const commandRegistry = useCommandRegistry()
	commandRegistry.addCommand(
		createNewActionCommand({
			fallbackURL: home().inbox.url!,
			selection: page.selection,
			expander: page.expander,
		})
	)
	commandRegistry.addCommand(createDeleteCommand(page))
	commandRegistry.addCommand(createCompleteCommand(page))
	commandRegistry.addCommand(createCancelCommand(page))

	return (
		<DragAndDropProvider value={page.dnd}>
			<div
				ref={element => {
					page.dnd.createDraggableList(element)
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
							actions={home().inbox.items.filter(page.filter)}
							toggleCanceled={(item, force) =>
								page.stage(() => item.toggleCanceled(force), item.url)
							}
							toggleCompleted={(i, f) =>
								page.stage(() => i.toggleCompleted(f), i.url)
							}
						/>
					</main>
				</div>
			</div>
		</DragAndDropProvider>
	)
}
