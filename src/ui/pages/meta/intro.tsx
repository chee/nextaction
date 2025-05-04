import {Button} from "@kobalte/core/button"
import "./intro.css"
import {decode} from "@/infra/lib/compress.ts"
import {isValidAutomergeUrl} from "@automerge/automerge-repo"
import {useNavigate} from "@solidjs/router"
import {createEffect} from "solid-js"
import {useUserId} from "@/infra/storage/user-id.ts"
import {createFirstTimeUser} from "@/viewmodel/user.ts"

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
				<h1>welcome to taskplace</h1>
				<p>
					<strong>is it your first time here?</strong>
				</p>
				<div class="intro-card__actions">
					<Button
						class="button"
						onClick={() => {
							onNewName(prompt("what's your name? (you can change this later)"))
						}}>
						yes! create new taskplace 🌱
					</Button>
					<Button
						class="button"
						onClick={() => {
							const code = prompt(
								"paste the share code you got from your other device"
							)
							if (code) {
								if (isValidAutomergeUrl(code)) setUserId(code)
								const result = decode(code)
								if (isValidAutomergeUrl(result)) setUserId(result)
							}
						}}>
						no! join existing taskplace 🌻
					</Button>
				</div>
			</div>
		</article>
	)
}
