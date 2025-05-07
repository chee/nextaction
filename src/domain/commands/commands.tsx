import type {JSX} from "solid-js"
import {createContext, useContext} from "solid-js"
import {createMutable, createStore} from "solid-js/store"
import debug from "debug"
import {useIsRouting} from "@solidjs/router"
import {createEffect} from "solid-js"
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

const history = createMutable<CommandHistoryEntry[]>([])
const future = createMutable<CommandHistoryEntry[]>([])

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

type CommandMap = Record<string, Command<any>>
type CommandContext = {
	commands: CommandMap
	setCommands(map: CommandMap): void
	exe: <Payload>(cmd: Command<Payload>, payload?: Payload) => void
}
const CommandRegistryContext = createContext<CommandContext>()

export function CommandRegistryProvider(props: {children: JSX.Element}) {
	const [commands, setCommands] = createStore<CommandMap>({})
	const navigating = useIsRouting()
	createEffect(() => {
		if (navigating()) {
			setCommands(() => ({}))
		}
	})
	return (
		<CommandRegistryContext.Provider value={{commands, setCommands, exe}}>
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
	return commandRegistry.commands[id].exe
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
