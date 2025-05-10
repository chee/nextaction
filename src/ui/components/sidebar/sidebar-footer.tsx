import "./sidebar-footer.css"
import {DropdownMenu} from "@kobalte/core/dropdown-menu"
import {Button} from "@kobalte/core/button"
import {toast} from "::ui/components/base/toast.tsx"
import BigPlus from "::ui/icons/big-plus.tsx"
import PreferencesIcon from "::ui/icons/preferences.tsx"
import {useNavigate} from "@solidjs/router"
import {encodeJSON} from "::core/util/compress.ts"
import {useUserId} from "::domain/identity/user-id.ts"
import {useHomeContext} from "::domain/useHome.ts"

export default function SidebarFooter() {
	const home = useHomeContext()

	const nav = useNavigate()
	return (
		<footer class="sidebar-footer">
			<DropdownMenu>
				<DropdownMenu.Trigger
					class="sidebar-footer__button"
					title="Add project or area">
					<BigPlus />{" "}
					<span class="sidebar-footer__optional-text">Add List</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content class="popmenu popmenu--new-list">
						<DropdownMenu.Item
							class="popmenu__item"
							onSelect={() => {
								const url = home.createProject()
								nav(`/projects/${url}`, {state: {isNewProject: true}})
							}}>
							<div class="sidebar-footer-new-list-choice">
								<span class="sidebar-footer-new-list-choice__title">
									<span class="sidebar-footer-new-list-choice__icon">🗂️</span>
									New Project
								</span>
								<p class="sidebar-footer-new-list-choice__description">
									A set of actions that will lead to a goal
								</p>
							</div>
						</DropdownMenu.Item>
						{/* <DropdownMenu.Item
							class="popmenu__item"
							onClick={() => {
								const url = createArea()
								nav(`/areas/${url}`, {state: {isNewArea: true}})
							}}>
							<div class="sidebar-footer-new-list-choice">
								<span class="sidebar-footer-new-list-choice__title">
									<span class="sidebar-footer-new-list-choice__icon">🗃️</span>{" "}
									New Area
								</span>
								<p class="sidebar-footer-new-list-choice__description">
									A group of projects and actions for an area of your life
								</p>
							</div>
						</DropdownMenu.Item> */}
						{/* <DropdownMenu.Item
							class="popmenu__item"
							onSelect={() => {
								const string = self.prompt(
									"Paste the project/area link your friend sent you"
								)
								if (string) {
									home.importProject(string)
								}
								// home.newArea()
							}}>
							<div class="sidebar-footer-new-list-choice">
								<span class="sidebar-footer-new-list-choice__title">
									<span class="sidebar-footer-new-list-choice__icon">👯</span>{" "}
									Import from friend
								</span>
								<p class="sidebar-footer-new-list-choice__description">
									Import a project or area from a friend
								</p>
							</div>
						</DropdownMenu.Item> */}
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu>

			<Button
				class="sidebar-footer__button"
				title="Open settings"
				onClick={() => {
					const [u] = useUserId()
					navigator.clipboard.writeText(
						encodeJSON({
							type: "user",
							url: u(),
						})
					)
					toast.show({
						title: "Settings?",
						body: "lol! what settings?",
					})
				}}>
				<PreferencesIcon />
			</Button>
		</footer>
	)
}
