import type {
	AnyParentType,
	AnyParentURL,
	ChildEntitiesFor,
	FlatChildEntitiesFor,
	FlatChildTypesFor,
	FlatChildURLsFor,
} from ":concepts:"
import {createMemo, mapArray, type Accessor} from "solid-js"
import {flatfilter} from "::core/util/flattenTree.ts"
import {createDragAndDropContext} from "../dnd/dnd-context.ts"
import {useStagingArea} from "../selection/useStagingArea.ts"
import {createSelectionContext} from "../selection/useSelection.ts"
import {useExpander} from "../selection/useExpander.ts"
import {useHotkeys} from "::ui/hotkeys/useHotkeys.ts"
import {useSelectionHotkeys} from "::ui/hotkeys/useSelectionHotkeys.ts"
import type {ActionURL} from "::shapes/action.ts"

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
	const selection = createSelectionContext(selectableItemURLs)
	const expander = useExpander(selection)
	const dnd = createDragAndDropContext<T>(selection)

	// todo maybe it's wrong to have this here
	useHotkeys("enter", () => {
		if (!expander.expanded()) {
			const lastSelected = selection.lastSelected()

			if (lastSelected) {
				expander.expand(lastSelected as ActionURL)
			}
		}
	})

	useSelectionHotkeys({selection, selectableItemURLs})
	return {
		isStaged,
		stage,
		selection,
		expander,
		dnd,
		selectableItems,
		selectableItemURLs,
		filter,

		get items() {
			return items()
		},
	}
}
