import type {
	AnyParentType,
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
import {getParentURL} from "::registries/parent-registry.ts"
import type {HeadingURL} from "::shapes/heading.ts"
import {useHomeContext} from "::domain/useHome.ts"
import {useModelAfterDark} from "::domain/useModel.ts"
import type {Heading} from "::domain/useHeading.ts"
import type {Project} from "::domain/useProject.ts"
import type {Area} from "::domain/useArea.ts"
import {getType} from "::registries/type-registry.ts"
import {useAction} from "::domain/useAction.ts"

// todo fix this so you can pass the generic the retruned list type
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
		expander: {
			...expander,
			// todo this doesn't belong here
			collapse() {
				const expanded = expander.expanded()
				expander.collapse()
				if (isEmptyAction(expanded)) {
					const parentURL = getParentURL(expanded)
					if (parentURL) {
						const parentType = getType(parentURL)
						if (parentType == "inbox") {
							useHomeContext()().inbox.removeItem("action", expanded)
						} else if (parentType == "home") {
							useHomeContext()().list.removeItem("action", expanded)
						} else {
							const parent = useModelAfterDark(parentURL) as
								| Accessor<Heading>
								| Accessor<Project>
								| Accessor<Area>

							if (parent()) {
								parent().removeItem("action", expanded)
							}
						}
					}
				}
			},
		},
		dnd,
		selectableItems,
		selectableItemURLs,
		filter,

		get items() {
			return items()
		},
	}
}

function isEmptyAction(
	url: ActionURL | HeadingURL | undefined
): url is ActionURL {
	if (!url) return false
	const type = getType(url)
	if (type != "action") return false
	const action = useAction(() => url as ActionURL)
	if (action().title.trim() || action().when || action().notes.trim()) {
		return false
	}
	return true
}
