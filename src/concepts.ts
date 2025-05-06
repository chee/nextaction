import type {ActionURL, Action} from "./domain/action.ts"
import type {Area, AreaURL} from "./domain/area.ts"
import type {HeadingURL, Heading} from "./domain/heading.ts"
import type {Home, HomeURL} from "./domain/home.ts"
import type {Inbox, InboxURL} from "./domain/inbox.ts"
import type {ProjectURL, Project} from "./domain/project.ts"
import type {Reference} from "./domain/reference.ts"
import type {ActionViewModel} from "./viewmodel/action.ts"
import type {AreaViewModel} from "./viewmodel/area.ts"
import type {HeadingViewModel} from "./viewmodel/heading.ts"
import type {HomeViewModel, InboxViewModel} from "./viewmodel/home.ts"
import type {ProjectViewModel} from "./viewmodel/project.ts"

export type ConceptURLMap = {
	home: HomeURL
	inbox: InboxURL
	area: AreaURL
	project: ProjectURL
	heading: HeadingURL
	action: ActionURL
}

export type ConceptName = keyof ConceptURLMap

export type ConceptModelMap = {
	home: Home
	inbox: Inbox
	area: Area
	project: Project
	heading: Heading
	action: Action
}

export type ConceptViewModelMap = {
	home: HomeViewModel
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

export type ParentConceptChildrenMap = {
	home: ["area", "project", "heading", "action"]
	inbox: ["action"]
	area: ["project", "action"]
	project: ["heading", "action"]
	heading: ["action"]
	action: []
}

export type ChildConceptParentMap = {
	area: "home"
	project: "home" | "area"
	heading: "home" | "area" | "project"
	action: "home" | "inbox" | "area" | "project" | "heading"
}

// export type TypeFromURL<U> = {
// 	[K in keyof ConceptURLMap]: U extends ConceptURLMap[K] ? K : never
// }[keyof ConceptURLMap]

export type TypeFromURL<U> = Extract<
	{
		[K in keyof ConceptURLMap]: U extends ConceptURLMap[K] ? K : never
	}[keyof ConceptURLMap],
	ConceptName
>
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

export type ChildTypesFor<T extends keyof ParentConceptChildrenMap> =
	ParentConceptChildrenMap[T][number]
export type ChildURLsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptURLMap[ChildTypesFor<T>]
export type ChildRefsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptReferenceMap[ChildTypesFor<T>]
export type ChildViewModelsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptViewModelMap[ChildTypesFor<T>]

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
