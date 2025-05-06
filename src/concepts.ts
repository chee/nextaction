import type {ActionURL, Action} from "::domain/action.ts"
import type {Area, AreaURL} from "::domain/area.ts"
import type {HeadingURL, Heading} from "::domain/heading.ts"
import type {Home, HomeURL} from "::domain/home.ts"
import type {Inbox, InboxURL} from "::domain/inbox.ts"
import type {ProjectURL, Project} from "::domain/project.ts"
import type {Reference} from "::domain/reference.ts"
import type {ActionViewModel} from "::viewmodel/action.ts"
import type {AreaViewModel} from "::viewmodel/area.ts"
import type {HeadingViewModel} from "::viewmodel/heading.ts"
import type {HomeViewModel, InboxViewModel} from "::viewmodel/home.ts"
import type {ProjectViewModel} from "::viewmodel/project.ts"
import {X} from "../output/assets/index-DX-pBdC7.js"

export type ConceptName =
	| "home"
	| "inbox"
	| "area"
	| "project"
	| "heading"
	| "action"

export type ConceptURLMap = {
	home: HomeURL
	inbox: InboxURL
	area: AreaURL
	project: ProjectURL
	heading: HeadingURL
	action: ActionURL
}

export type ConceptURLFromType<U> = U extends "home"
	? HomeURL
	: U extends "inbox"
	? InboxURL
	: U extends "area"
	? AreaURL
	: U extends "project"
	? ProjectURL
	: U extends "heading"
	? HeadingURL
	: U extends "action"
	? ActionURL
	: never

export type ConceptModelMap = {
	home: Home
	inbox: Inbox
	area: Area
	project: Project
	heading: Heading
	action: Action
}

export type ConceptViewModelMap = {
	home: HomeViewModel["list"]
	inbox: InboxViewModel
	area: AreaViewModel
	project: ProjectViewModel
	heading: HeadingViewModel
	action: ActionViewModel
}

export type ConceptReferenceMap = {
	home: Reference<"home">
	inbox: Reference<"inbox">
	area: Reference<"area">
	project: Reference<"project">
	heading: Reference<"heading">
	action: Reference<"action">
}

export const ParentConceptChildrenMap = {
	home: ["area", "project", "action"] as const,
	inbox: ["action"] as const,
	area: ["project", "action"] as const,
	project: ["heading", "action"] as const,
	heading: ["action"] as const,
	action: [] as const,
}
export type ParentConceptChildrenMap = typeof ParentConceptChildrenMap

export const ChildConceptParentMap = {
	area: ["home"] as const,
	project: ["home", "area"] as const,
	heading: ["home", "area", "project"] as const,
	action: ["home", "inbox", "area", "project", "heading"] as const,
}
export type ChildConceptParentMap = typeof ChildConceptParentMap

export const FlatChildrenMap = {
	home: ["area", "project", "heading", "action"] as const,
	inbox: ["action"] as const,
	area: ["project", "heading", "action"] as const,
	project: ["heading", "action"] as const,
	heading: ["action"] as const,
	action: [] as const,
}
export type FlatChildrenMap = typeof FlatChildrenMap

export type TypeFromURL<U> = U extends HomeURL
	? "home"
	: U extends InboxURL
	? "inbox"
	: U extends AreaURL
	? "area"
	: U extends ProjectURL
	? "project"
	: U extends HeadingURL
	? "heading"
	: U extends ActionURL
	? "action"
	: never
export type AnyRef = ConceptReferenceMap[keyof ConceptReferenceMap]
export type AnyConceptURL = ConceptURLMap[keyof ConceptURLMap]
export type AnyConceptModel = ConceptModelMap[keyof ConceptModelMap]
export type AnyConceptViewModel = ConceptViewModelMap[keyof ConceptViewModelMap]

export type AnyParentType = "home" | "inbox" | "area" | "project" | "heading"
export type AnyParentURL = ConceptURLMap[AnyParentType]
export type AnyParentModel = ConceptModelMap[AnyParentType]
export type AnyParentViewModel = ConceptViewModelMap[AnyParentType]
export type AnyParentRef = ConceptReferenceMap[AnyParentType]
export type AnyChildType = "area" | "project" | "heading" | "action"
export type AnyChildURL = ConceptURLMap[AnyChildType]
export type AnyChildModel = ConceptModelMap[AnyChildType]
export type AnyChildViewModel = ConceptViewModelMap[AnyChildType]
export type AnyChildRef = ConceptReferenceMap[AnyChildType]
export type AnyDoableType = "action" | "project"
export type AnyDoableURL = ConceptURLMap[AnyDoableType]
export type AnyDoableModel = ConceptModelMap[AnyDoableType]
export type AnyDoableViewModel = ConceptViewModelMap[AnyDoableType]
export type AnyDoableRef = ConceptReferenceMap[AnyDoableType]

export type ChildTypesFor<T extends keyof ParentConceptChildrenMap> =
	ParentConceptChildrenMap[T][number]

export type ChildURLsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptURLMap[ChildTypesFor<T>]

export type ChildRefsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptReferenceMap[ChildTypesFor<T>]
export type ChildViewModelsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptViewModelMap[ChildTypesFor<T>]

export type FlatChildTypesFor<T extends keyof FlatChildrenMap> =
	FlatChildrenMap[T][number]
export type FlatChildURLsFor<T extends keyof FlatChildrenMap> =
	ConceptURLMap[FlatChildTypesFor<T>]
export type FlatChildRefsFor<T extends keyof FlatChildrenMap> =
	ConceptReferenceMap[FlatChildTypesFor<T>]
export type FlatChildViewModelsFor<T extends keyof FlatChildrenMap> =
	ConceptViewModelMap[FlatChildTypesFor<T>]

export type ViewModelsOfChildren<U> =
	TypeFromURL<U> extends keyof ParentConceptChildrenMap
		? ConceptViewModelMap[ParentConceptChildrenMap[TypeFromURL<U>][number]]
		: never

export type RefsOfChildren<U> =
	TypeFromURL<U> extends keyof ParentConceptChildrenMap
		? ConceptReferenceMap[ParentConceptChildrenMap[TypeFromURL<U>][number]]
		: never

export type ChildToValidParentTypes = {
	[C in ConceptName]: {
		[P in keyof ParentConceptChildrenMap]: C extends ParentConceptChildrenMap[P][number]
			? P
			: never
	}[keyof ParentConceptChildrenMap]
}
