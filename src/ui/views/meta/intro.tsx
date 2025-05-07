import {Button} from "@kobalte/core/button"
import "./intro.css"
import {isValidAutomergeUrl} from "@automerge/automerge-repo"
import {useNavigate} from "@solidjs/router"
import {createEffect} from "solid-js"
import {createFirstTimeUser} from "::domain/entities/useUser.ts"
import {toast} from "::ui/components/base/toast.tsx"
import {decodeJSON} from "::core/util/compress.ts"
import {useUserId} from "::domain/identity/user-id.ts"
import type {UserURL} from "::shapes/user.ts"

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
				<h1>welcome to Next Action</h1>
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

export type UserRef = {url: UserURL; type: "user"}
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
