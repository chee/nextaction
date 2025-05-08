import {createContext, createSignal, useContext, type JSX} from "solid-js"
import type {AnyChildURL, AnyConceptURL, AnyParentURL} from ":concepts:"
import {useMovements} from "::domain/movements/useMovements.ts"

interface GlobalOperationsContext {
	setSelectedURLs(urls: AnyChildURL[]): void
	dragAndDrop(dragged: AnyConceptURL[], dropTarget: AnyConceptURL): void
}

export const GlobalOperationsContext = createContext<GlobalOperationsContext>()

function GlobalOperationsProvider(props: {children: JSX.Element}) {
	// todo generic new action maybe?
	const [selectedURLs, setSelectedURLs] = createSignal<AnyChildURL[]>([])
	const movements = useMovements()

	return (
		<GlobalOperationsContext.Provider
			value={{
				setSelectedURLs,
				dragAndDrop: (dragged, dropTarget) => {
					movements.drop(dragged as AnyChildURL[], dropTarget as AnyParentURL)
					setSelectedURLs([])
				},
			}}>
			{props.children}
		</GlobalOperationsContext.Provider>
	)
}

function useGlobalOperations() {
	const context = useContext(GlobalOperationsContext)
	if (!context) {
		throw new Error(
			"useGlobalOperations must be used within a GlobalOperationsProvider"
		)
	}
	return context
}
