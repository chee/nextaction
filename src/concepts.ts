import type {ActionShape, ActionURL} from "::shapes/action.ts"
import type {AreaShape, AreaURL} from "::shapes/area.ts"
import type {HeadingShape, HeadingURL} from "::shapes/heading.ts"
import type {HomeShape, HomeURL} from "::shapes/home.ts"
import type {InboxShape, InboxURL} from "::shapes/inbox.ts"
import type {ProjectShape, ProjectURL} from "::shapes/project.ts"
import type {Reference} from "::shapes/reference.ts"
import type {Home, Inbox} from "::domain/useHome.ts"
import type {Area} from "::domain/useArea.ts"
import type {Project} from "::domain/useProject.ts"
import type {Heading} from "::domain/useHeading.ts"
import type {Action} from "::domain/useAction.ts"

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

export type ConceptShapeMap = {
	home: HomeShape
	inbox: InboxShape
	area: AreaShape
	project: ProjectShape
	heading: HeadingShape
	action: ActionShape
}

export type ConceptModelMap = {
	// todo
	home: Home["list"]
	inbox: Inbox
	area: Area
	project: Project
	heading: Heading
	action: Action
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
export type AnyConceptModel = ConceptShapeMap[keyof ConceptShapeMap]
export type AnyConcept = ConceptModelMap[keyof ConceptModelMap]

export type AnyParentType = "home" | "inbox" | "area" | "project" | "heading"
export type AnyParentURL = ConceptURLMap[AnyParentType]
export type AnyParentModel = ConceptShapeMap[AnyParentType]
export type AnyParent = ConceptModelMap[AnyParentType]
export type AnyParentRef = ConceptReferenceMap[AnyParentType]
export type AnyChildType = "area" | "project" | "heading" | "action"
export type AnyChildURL = ConceptURLMap[AnyChildType]
export type AnyChildModel = ConceptShapeMap[AnyChildType]
export type AnyChild = ConceptModelMap[AnyChildType]
export type AnyChildRef = ConceptReferenceMap[AnyChildType]
export type AnyDoableType = "action" | "project"
export type AnyDoableURL = ConceptURLMap[AnyDoableType]
export type AnyDoableModel = ConceptShapeMap[AnyDoableType]
export type AnyDoable = ConceptModelMap[AnyDoableType]
export type AnyDoableRef = ConceptReferenceMap[AnyDoableType]

export type ChildTypesFor<T extends keyof ParentConceptChildrenMap> =
	ParentConceptChildrenMap[T][number]

export type ChildURLsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptURLMap[ChildTypesFor<T>]

export type ChildRefsFor<T extends keyof ParentConceptChildrenMap> =
	ConceptReferenceMap[ChildTypesFor<T>]
export type ChildEntitiesFor<T extends keyof ParentConceptChildrenMap> =
	ConceptModelMap[ChildTypesFor<T>]

export type FlatChildTypesFor<T extends keyof FlatChildrenMap> =
	FlatChildrenMap[T][number]
export type FlatChildURLsFor<T extends keyof FlatChildrenMap> =
	ConceptURLMap[FlatChildTypesFor<T>]
export type FlatChildRefsFor<T extends keyof FlatChildrenMap> =
	ConceptReferenceMap[FlatChildTypesFor<T>]
export type FlatChildEntitiesFor<T extends keyof FlatChildrenMap> =
	ConceptModelMap[FlatChildTypesFor<T>]

export type EntitiesOfChildren<U> =
	TypeFromURL<U> extends keyof ParentConceptChildrenMap
		? ConceptModelMap[ParentConceptChildrenMap[TypeFromURL<U>][number]]
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
