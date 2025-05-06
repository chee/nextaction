import {createSignal} from "solid-js"
import {
	createSelectionContext,
	type SelectionContext,
} from "::infra/hooks/selection-context.ts"
import {debounce} from "radash"
import type {ExpandableProps} from "::ui/components/actions/action.tsx"
import {createEffect} from "solid-js"
import type {
	AnyChildType,
	ChildViewModelsFor,
	ConceptName,
	ConceptURLMap,
	FlatChildTypesFor,
	FlatChildViewModelsFor,
} from "::concepts"
import {useCommandRegistry} from "::ui/commands/commands.tsx"
import {createDragAndDropContext} from "::infra/dnd/dnd-context.ts"
import {flatfilter} from "::infra/lib/flattenTree.ts"
import {mapArray} from "solid-js"
import {createMemo} from "solid-js"
import {useHotkeys} from "::infra/lib/hotkeys.ts"
import {onCleanup} from "solid-js"

export type ExpandableConcept = "action" | "heading"

export function useExpander<C extends ExpandableConcept>(
	selection: SelectionContext
) {
	type T = ConceptURLMap[C]
	const [expanded, setExpanded] = createSignal<T>()

	return {
		isExpanded: (url: T) => expanded() == url,
		expanded,
		expand(url: T) {
			setExpanded(() => url)
			selection.clearSelected()
		},
		collapse() {
			const url = expanded()
			setExpanded()
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			url && selection.select(url)
		},
		props(url: T): ExpandableProps {
			return {
				expanded: expanded() == url,
				expand: () => setExpanded(() => url),
				collapse: () => setExpanded(),
			}
		},
	}
}

export type Expander<C extends ExpandableConcept> = ReturnType<
	typeof useExpander<C>
>

export function useStagingArea<C extends AnyChildType>(delay = 2400) {
	type T = ConceptURLMap[C]
	const [staged, setStaged] = createSignal<T[]>([])
	const clear = debounce({delay}, () => setStaged([]))
	const hold = (url: T) => {
		setStaged(staged().concat(url))
		clear()
	}
	const stage = (fn: () => void, url: T) => {
		fn()
		hold(url)
	}
	// eslint-disable-next-line solid/reactivity
	return [(url: T) => staged().includes(url), stage] as const
}

export function usePageContext<T extends ConceptName>({
	items,
	selectableItemFilter,
}: {
	items(): ChildViewModelsFor<T>[]
	selectableItemFilter(item: FlatChildViewModelsFor<T>): boolean
}) {
	const [isStaged, stage] = useStagingArea<FlattenedChild>()
	const filter = (item: FlatChildViewModelsFor<T>) =>
		selectableItemFilter(item) ||
		isStaged(item.url as Parameters<typeof isStaged>[0])

	type FlattenedChild = FlatChildTypesFor<T>
	const selectableItems = createMemo(
		() =>
			flatfilter(items(), item => filter(item)) as FlatChildViewModelsFor<T>[]
	)
	const selectableItemURLs = mapArray(selectableItems, i => i.url)
	const commandRegistry = useCommandRegistry()
	const selection = createSelectionContext(selectableItemURLs)
	const expander = useExpander(selection)
	const dnd = createDragAndDropContext(selection)

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
	}
}
