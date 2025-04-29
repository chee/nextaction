import Bar, {BarButton} from "../components/bar/bar.tsx"
import ActionList from "@/ui/components/actions/action-list.tsx"
import {useInboxPage} from "@/viewmodel/pages/inbox-page.ts"
import BigPlus from "@/ui/icons/big-plus.tsx"
import {useHotkeys} from "@/infra/lib/hotkeys.ts"
import type {ActionURL} from "@/domain/action.ts"
import {createShortcut} from "@solid-primitives/keyboard"

export default function Inbox() {
	const page = useInboxPage()

	function createNewAction() {
		const url = page.inbox.newAction({}, page.list.lastSelectedIndex() + 1)
		page.list.select(url)
		setTimeout(() => {
			page.expand(url)
		})
		return url
	}

	createShortcut(["ArrowUp"], () => {
		const index = page.list.lastSelectedIndex()
		if (index > 0) {
			page.list.select(page.inbox.actions[index - 1].url)
		} else {
			page.list.select(page.inbox.actions[0].url)
		}
	})

	createShortcut(["ArrowDown"], () => {
		const index = page.list.lastSelectedIndex()
		console.log({index})
		const len = page.inbox.actions.length
		if (index < len - 1) {
			page.list.select(page.inbox.actions[index + 1].url)
		}
	})

	createShortcut(["Backspace"], () => {
		page.inbox.removeAction(...(page.list.selected() as ActionURL[]))
	})
	createShortcut([" "], () => createNewAction())
	createShortcut(["Enter"], () =>
		page.expand(page.list.selected()[0] as ActionURL)
	)
	useHotkeys(
		"cmd+k",
		() => page.inbox.actions[page.list.lastSelectedIndex()]?.toggle(),
		{
			preventDefault: () => true,
		}
	)

	return (
		<div class="inbox">
			<Bar>
				<BarButton
					icon={<BigPlus />}
					label="new action"
					onClick={() => {
						const url = page.inbox.newAction()
						page.list.select(url)
					}}
				/>
			</Bar>
			<div class="page">
				<h1 class="page-title">
					<div class="page-title__icon">📥</div>
					<span class="page-title__title">Inbox</span>
				</h1>
				<ActionList
					list={page.list}
					expand={page.expand}
					collapse={page.collapse}
					isSelected={url => page.list.selected().includes(url)}
					isExpanded={url => !!page.expanded()?.includes(url)}
					{...page.inbox}
				/>
			</div>
		</div>
	)
}
