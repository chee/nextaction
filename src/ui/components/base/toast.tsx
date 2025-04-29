import "./toast.css"
import { Toast, toaster } from "@kobalte/core/toast"
import type { JSX } from "solid-js"
import { Portal } from "solid-js/web"

export function show(opts: {
	title: JSX.Element
	body: JSX.Element
	modifier?: string
}) {
	const { title, body, modifier } = opts
	return toaster.show((props) => (
		<Toast
			toastId={props.toastId}
			classList={{
				toast: true,
				[`toast--${modifier}`]: !!modifier,
			}}
		>
			<div class="toast__content">
				<div>
					<Toast.Title class="toast__title">{title}</Toast.Title>
					<Toast.Description class="toast__body">{body}</Toast.Description>
				</div>
				<Toast.CloseButton class="toast__close">
					<span class="toast__close-icon" aria-hidden="true">
						&times;
					</span>
					<span class="screenreader">Close</span>
				</Toast.CloseButton>
			</div>
		</Toast>
	))
}

export const toast = { show }

export function ToastRegion() {
	return (
		<Portal>
			<Toast.Region class="toast-region">
				<Toast.List class="toast-list" />
			</Toast.Region>
		</Portal>
	)
}
