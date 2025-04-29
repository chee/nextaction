import { useRegisterSW } from "virtual:pwa-register/solid"
import { createEffect } from "solid-js"
import { toast } from "./toast.tsx"
import { Button } from "@kobalte/core/button"

export default function ServiceWorker() {
	const {
		updateServiceWorker,
		needRefresh: [needRefresh, _setNeedRefresh],
		offlineReady: [offlineReady, _setOfflineReady],
	} = useRegisterSW({
		onRegistered(registration) {
			if (registration && "navigationPreload" in registration) {
				registration.navigationPreload.enable()
			}
		},
		onRegisterError(error: Error) {
			console.log("SW registration error", error)
		},
	})

	createEffect(() => {
		if (needRefresh()) {
			toast.show({
				title: "Update available",
				body: (
					<>
						<p>refresh to update</p>
						<Button
							class="primary button"
							onClick={() => updateServiceWorker(true)}
						>
							refresh
						</Button>
					</>
				),
			})
		}

		if (offlineReady()) {
			toast.show({
				title: "Offline ready",
				body: "you can disconnect from the internet",
			})
		}
	})

	return null
}
