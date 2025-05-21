import type {JSX} from "solid-js"
import {createContext, getOwner, useContext} from "solid-js"
import {createMutable, createStore, reconcile} from "solid-js/store"
import debug from "debug"
import {useIsRouting} from "@solidjs/router"
import {createEffect} from "solid-js"
import {runWithOwner} from "solid-js"
const log = debug("nextaction:commands")

type CommandHistoryEntry = {
	undo?: () => void
	redo?: () => void
}

export interface Command<Payload = void> {
	id: string
	label: string
	order?: number
	shortcut?: string
	exe: (payload: Payload) => CommandHistoryEntry
}

export function createCommand<Payload = void>(
	cmd: Command<Payload>
): Command<Payload> {
	return cmd
}

export function useCanUndo() {
	const canUndo = () => history.length > 0
	const canRedo = () => future.length > 0
	return [canUndo, canRedo]
}

const history = createMutable<CommandHistoryEntry[]>([])
const future = createMutable<CommandHistoryEntry[]>([])
let lastEntryTime = Date.now()
const COMBINE_THRESHOLD = 500
export function pushHistoryEntry(entry: CommandHistoryEntry) {
	if (history.length > 0 && Date.now() - lastEntryTime < COMBINE_THRESHOLD) {
		const lastEntry = history[history.length - 1]
		const combinedUndo = () => {
			if (entry.undo) entry.undo()
			if (lastEntry.undo) lastEntry.undo()
		}
		const combinedRedo = () => {
			if (lastEntry.redo) lastEntry.redo()
			if (entry.redo) entry.redo()
		}
		history[history.length - 1] = {
			undo: combinedUndo,
			redo: combinedRedo,
		}
	} else {
		history.push(entry)
	}
	lastEntryTime = Date.now()
}

export function exe<Payload>(cmd: Command<Payload>, payload?: Payload) {
	const entry = cmd.exe(payload!)
	history.push(entry)
	future.splice(0, future.length)
}

export function undo() {
	const entry = history.pop()
	if (!entry || !entry.undo) return
	entry.undo()
	future.push(entry)
}

export function redo() {
	const entry = future.pop()
	if (!entry || !entry.redo) return
	entry.redo()
	history.push(entry)
}

type CommandMap = Record<string, Command<unknown>>
type CommandContext = {
	commands: CommandMap
	setCommands(map: CommandMap): void
	resetCommands(): void
	addCommand(cmd: Command): void
	has(id: Command["id"]): boolean
	exe: <Payload>(id: Command["id"], payload?: Payload) => void
}
const CommandRegistryContext = createContext<CommandContext>()

export function CommandRegistryProvider(props: {children: JSX.Element}) {
	const [commands, setCommands] = createStore<CommandMap>({})
	const navigating = useIsRouting()
	createEffect(() => {
		if (navigating()) {
			setCommands(reconcile({}))
		}
	})
	const owner = getOwner()
	return (
		<CommandRegistryContext.Provider
			value={{
				commands,
				setCommands,
				has(id) {
					return id in commands && commands[id].id == id
				},
				resetCommands() {
					setCommands(reconcile({}))
				},
				addCommand(cmd) {
					if (cmd.id in commands) {
						log(`command ${cmd.id} already exists, overwriting`)
					}
					log(`registering command ${cmd.id}`)
					setCommands({
						...commands,
						[cmd.id]: cmd,
					})
				},
				exe(id, payload) {
					const cmd = commands[id]

					if (!cmd) {
						log(`tried to run command ${id} but it does not exist`)
						return
					}
					runWithOwner(owner, () => exe(cmd, payload))
				},
			}}>
			{props.children}
		</CommandRegistryContext.Provider>
	)
}

export function useCommandRegistry() {
	const cmds = useContext(CommandRegistryContext)
	if (!cmds) {
		throw new Error(
			"useCommandContext must be used within a CommandContextProvider"
		)
	}
	return cmds
}

export function useCommand(id: string) {
	const commandRegistry = useCommandRegistry()
	if (!(id in commandRegistry.commands)) {
		log(`tried to run command ${id} but it does not exist`)
		return
	}
	return commandRegistry.commands[id]
}

export function registerCommand<T>(cmd: Command<T>) {
	const registry = useCommandRegistry()
	log(`registering command ${cmd.id}`)
	if (cmd.id in registry.commands) {
		log(`command ${cmd.id} already exists, overwriting`)
	}
	registry.setCommands({
		...registry.commands,
		[cmd.id]: cmd,
	})
}

