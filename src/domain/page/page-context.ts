import type {
	AnyParentType,
	ChildEntitiesFor,
	ConceptEntityMap,
	FlatChildEntitiesFor,
	FlatChildTypesFor,
	FlatChildURLsFor,
} from ":concepts:"
import {useStagingArea} from "../state/useStagingArea.ts"
import {
	createEffect,
	createMemo,
	mapArray,
	onCleanup,
	type Accessor,
} from "solid-js"
import {flatfilter} from "::core/util/flattenTree.ts"
import {useCommandRegistry} from "../commands/commands.tsx"
import {createSelectionContext} from "../state/useSelection.ts"
import {useExpander} from "../state/useExpander.ts"
import {createDragAndDropContext} from "../dnd/dnd-context.ts"
import {useHotkeys} from "../../ui/util/hotkeys.ts"
import {getType} from "../registries/type-registry.ts"

export function usePageContext<T extends AnyParentType>({
	items,
	selectableItemFilter,
}: {
	items(): ChildEntitiesFor<T>[]
	selectableItemFilter(item: FlatChildEntitiesFor<T>): boolean
}) {
	const [isStaged, stage] = useStagingArea<FlattenedChild>()
	const filter = (item: FlatChildEntitiesFor<T>) =>
		selectableItemFilter(item) ||
		isStaged(item.url as Parameters<typeof isStaged>[0])

	type FlattenedChild = FlatChildTypesFor<T>
	const selectableItems = createMemo(
		() => flatfilter(items(), item => filter(item)) as FlatChildEntitiesFor<T>[]
	)
	const selectableItemURLs = mapArray(selectableItems, i => i.url) as Accessor<
		FlatChildURLsFor<T>[]
	>
	const commandRegistry = useCommandRegistry()
	const selection = createSelectionContext(selectableItemURLs)
	const expander = useExpander(selection)
	const dnd = createDragAndDropContext<T>(selection)

	createEffect(() => {
		for (const command of Object.values(commandRegistry.commands)) {
			if (command.shortcut) {
				onCleanup(
					useHotkeys(command.shortcut, () => {
						commandRegistry.exe(command, selection.selected())
					})
				)
			}
		}
	})

	return {
		isStaged,
		stage,
		selection,
		expander,
		dnd,
		commandRegistry,
		selectableItems,
		selectableItemURLs,
		filter,
		// hmm, but when an action is in a certain context it needs to be cloned.

		newAction() {
			const selected = selection.selected()
			const selectedItem = selected[selected.length - 1]
			const type = getType(selectedItem)
			if (type == "heading") {
				// special case where a selected heading means adding an item to the heading
			}
		},
	}
}
