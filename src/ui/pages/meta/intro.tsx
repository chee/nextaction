import {Button} from "@kobalte/core/button"
import "./intro.css"
import {decode, decodeJSON} from "@/infra/lib/compress.ts"
import {isValidAutomergeUrl, type AutomergeUrl} from "@automerge/automerge-repo"
import {useNavigate} from "@solidjs/router"
import {createEffect} from "solid-js"
import {useUserId} from "@/infra/storage/user-id.ts"
import {createFirstTimeUser} from "@/viewmodel/user.ts"
import {toast} from "../../components/base/toast.tsx"

export default function Intro() {
	const nav = useNavigate()
	const [userId, setUserId] = useUserId()
	createEffect(() => {
		if (userId()) {
			return nav("/today")
		}
	})
	const onNewName = (name: string | null) => {
		if (name) {
			createFirstTimeUser(name)
			nav("/today")
		}
	}

	return (
		<article class="intro">
			<div class="intro-card">
				<p>hi ✨</p>
				<h1>welcome to nextaction</h1>
				<p>
					<strong>is it your first time here?</strong>
				</p>
				<div class="intro-card__actions">
					<Button
						class="button"
						onClick={() => {
							onNewName(prompt("what's your name? (you can change this later)"))
						}}>
						yes! create new space 🌱
					</Button>
					<Button
						class="button"
						onClick={() => {
							const code = prompt(
								"paste the share code you got from your other device"
							)
							if (code) {
								if (isValidAutomergeUrl(code)) setUserId(code)

								const result = decodeJSON<UserRef | unknown>(code)
								if (isUserRef(result)) {
									setUserId(result.url)
								} else {
									toast.show({
										title: "didn't work",
										body: "sorry",
										modifiers: "ohno",
									})
								}
							}
						}}>
						no! join existing space 🌻
					</Button>
				</div>
			</div>
		</article>
	)
}

export type UserRef = {url: AutomergeUrl; type: "user"}
function isUserRef(obj: unknown): obj is UserRef {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"url" in obj &&
		"type" in obj &&
		(obj as UserRef).type === "user" &&
		isValidAutomergeUrl((obj as UserRef).url)
	)
}
