import type {Selection} from "::domain/state/useSelection.ts"
import {useHotkeys} from "./useHotkeys.ts"

export function useSelectionHotkeys<T extends string = string>(props: {
	selectableItemURLs(): T[]
	selection: Selection<T>
}) {
	useHotkeys("up", () => {
		const index = props.selection.lastSelectedIndex()
		if (index > 0) {
			props.selection.select(props.selectableItemURLs()[index - 1])
		} else {
			props.selection.select(props.selectableItemURLs()[0])
		}
	})

	useHotkeys("ctrl+p", () => {
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

	useHotkeys("ctrl+n", () => {
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
