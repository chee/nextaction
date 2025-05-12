import {useHomeContext, type Home} from "::domain/useHome.ts"
import {isProject, type Project} from "::domain/useProject.ts"
import {isAction, type Action} from "::domain/useAction.ts"
import {usePageContext} from "./common/page.ts"
import {isClosed, isToday} from "::shapes/mixins/doable.ts"
import mix from "::core/util/mix.ts"

export function useTodayViewModel() {
	const home = useHomeContext()
	const items = () => home().list.items

	const page = usePageContext({
		items,
		selectableItemFilter(item: Home["list"]["items"][number]) {
			return (
				(isProject(item) || isAction(item)) &&
				isToday(item) &&
				!item.deleted &&
				!isClosed(item)
			)
		},
	})

	return mix(page, {
		expander: page.expander,
		toggleCompleted(item: Action | Project, force?: boolean) {
			page.stage(() => item.toggleCompleted(force), item.url)
		},
		toggleCanceled(item: Action | Project, force?: boolean) {
			page.stage(() => item.toggleCanceled(force), item.url)
		},
	})
}
