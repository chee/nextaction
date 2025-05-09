import "./logout.css"
import {redirect, useNavigate} from "@solidjs/router"
import {encodeJSON} from "::core/util/compress.ts"
import {toast} from "../../components/base/toast.tsx"
import {useUserId} from "::domain/identity/user-id.ts"

export default function LogoutPage() {
	const [userId, setUserId, deleteUserId] = useUserId()
	const current = encodeJSON({type: "user", url: userId()})
	return (
		<div class="page-container page-container--logout">
			<article class="page">
				<h1 class="page-title">logout</h1>
				<main class="page-content">
					<p>Are you sure you want to logout?</p>

					<p>
						To get back in you'll need this:
						<code
							onClick={() => {
								navigator.clipboard.writeText(current)
								toast.show("copied to clipboard")
							}}>
							{current}
						</code>
					</p>

					<button
						type="button"
						class="danger button"
						style={{margin: "1rem"}}
						onClick={() => {
							setUserId(undefined)
							deleteUserId()
							redirect("/")
							const nav = useNavigate()
							location.reload()
							nav("/")
						}}>
						logout
					</button>
				</main>
			</article>
		</div>
	)
}
