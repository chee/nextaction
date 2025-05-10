import {Button} from "@kobalte/core/button"
import "./intro.css"
import {useNavigate} from "@solidjs/router"
import {createEffect, createSignal} from "solid-js"
import {toast} from "::ui/components/base/toast.tsx"
import {decodeJSON} from "::core/util/compress.ts"
import {useUserId} from "::domain/identity/user-id.ts"
import {createUser, isUserRef, type UserRef} from "::shapes/user.ts"

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
			setUserId(createUser({name}))
			nav("/today")
		}
	}

	const [txt, setTxt] = createSignal("")

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
							)?.trim()
							if (code) {
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
						no! join existing space 💆‍♀️
					</Button>
				</div>
			</div>
			<form
				style={{position: "fixed", bottom: 0}}
				onSubmit={() => {
					if (txt().trim()) {
						const result = decodeJSON<UserRef | unknown>(txt().trim())
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
				<input
					type="text"
					value={txt()}
					onInput={event => setTxt(event.target.value)}></input>
				<button type="submit" style={{opacity: 0}}>
					ok
				</button>
			</form>
		</article>
	)
}
