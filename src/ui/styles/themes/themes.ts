import {makePersisted} from "@solid-primitives/storage"
import {createEffect} from "solid-js"
import {createRoot} from "solid-js"
import {createSignal} from "solid-js"
import {createStore} from "solid-js/store"

const [theme, setTheme] = makePersisted(createSignal(""), {
	name: "nextaction:theme",
})

const [colors, setColors] = makePersisted(
	createStore({} as Record<string, string>),
	{
		name: "nextaction:colors",
	}
)

const defaultIcons = {
	today: "⭐",
	upcoming: "📆",
	anytime: "📄",
	someday: "📦",
	logbook: "✅",
	trash: "🚮",
} as Record<string, string>

const [icons, setIcons] = makePersisted(createStore(defaultIcons), {
	name: "nextaction:icons",
})

export {icons, colors}

const query = new URLSearchParams(self.location.search)

if (query.has("theme")) {
	setTheme(query.get("theme")!)
	query.delete("theme")
}

for (const [key, value] of query.entries()) {
	if (key in defaultIcons) {
		// todo move to a util func
		const single = [...new Intl.Segmenter().segment(value)]?.[0]?.segment
		setIcons(key, single)
	}
	setColors(key, value)
}

createRoot(() => {
	createEffect(() => {
		if (theme) {
			document.documentElement.setAttribute("theme", theme())
		}

		if (colors) {
			for (const [key, value] of Object.entries(colors)) {
				if (value.startsWith("#")) {
					value.replace("#", "")
				}
				if (
					value.match(/^[0-9a-f]{6}$/i) ||
					value.match(/^[0-9a-f]{3}$/i) ||
					value.match(/^[0-9a-f]{8}$/i)
				) {
					document.documentElement.style.setProperty(`--${key}`, `#${value}`)
				} else {
					document.documentElement.style.setProperty(`--${key}`, value)
				}
			}
		}
	})
})
