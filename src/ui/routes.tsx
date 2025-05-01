/* @refresh reload */
import {lazy} from "solid-js"
import {render} from "solid-js/web"
import {Route, Router} from "@solidjs/router"
import App from "./layouts/app.tsx"

render(
	() => (
		<Router root={App}>
			<Route path="/" component={lazy(() => import("./pages/intro.tsx"))} />
			<Route component={lazy(() => import("./layouts/chrome.tsx"))}>
				<Route
					path="/inbox"
					component={lazy(() => import("./pages/inbox.tsx"))}
				/>
				<Route
					path="/dropbox/:dropboxId"
					component={lazy(() => import("./pages/dropbox.tsx"))}
				/>

				<Route
					path="/today"
					component={lazy(() => import("./pages/today.tsx"))}
				/>
				<Route
					path="/upcoming"
					component={lazy(() => import("./pages/upcoming.tsx"))}
				/>
				<Route
					path="/anytime"
					component={lazy(() => import("./pages/anytime.tsx"))}
				/>
				<Route
					path="/someday"
					component={lazy(() => import("./pages/someday.tsx"))}
				/>

				<Route
					path="/logbook"
					component={lazy(() => import("./pages/logbook.tsx"))}
				/>

				<Route
					path="/trash"
					component={lazy(() => import("./pages/trash.tsx"))}
				/>

				<Route
					path="/tags"
					component={lazy(() => import("./pages/tags.tsx"))}
				/>
				<Route
					path="/search"
					component={lazy(() => import("./pages/search.tsx"))}
				/>
				<Route
					path="/settings"
					component={lazy(() => import("./pages/settings.tsx"))}
				/>

				<Route
					path="/tags/:tagId"
					component={lazy(() => import("./pages/tag.tsx"))}
				/>
				<Route
					path="/areas/:areaId"
					component={lazy(() => import("./pages/area.tsx"))}
				/>
				<Route
					path="/projects/:projectId"
					component={lazy(() => import("./pages/404.tsx"))}
				/>
			</Route>
		</Router>
	),
	document.getElementById("app")!
)
