/* @refresh reload */
import "temporal-polyfill/global"
import {lazy} from "solid-js"
import {render} from "solid-js/web"
import {Route, Router} from "@solidjs/router"
import App from "./layouts/app.tsx"

// todo
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API#browser_compatibility

render(
	() => (
		<Router root={App}>
			<Route path="/share" component={() => "not implemented"} />

			<Route
				path="/"
				component={lazy(() => import("./routes/meta/intro.tsx"))}
			/>
			<Route component={lazy(() => import("./layouts/chrome.tsx"))}>
				<Route
					path="/today"
					component={lazy(() => import("./routes/today/today.tsx"))}
				/>
				<Route
					path="/inbox"
					component={lazy(() => import("./routes/standard/inbox.tsx"))}
				/>
				<Route
					path="/dropbox/:dropboxId"
					component={lazy(() => import("./routes/userland/dropbox.tsx"))}
				/>

				<Route
					path="/upcoming"
					component={lazy(() => import("./routes/upcoming/upcoming.tsx"))}
				/>
				<Route
					path="/anytime"
					component={lazy(() => import("./routes/standard/anytime.tsx"))}
				/>
				<Route
					path="/someday"
					component={lazy(() => import("./routes/standard/someday.tsx"))}
				/>

				<Route
					path="/logbook"
					component={lazy(() => import("./routes/standard/logbook.tsx"))}
				/>

				<Route
					path="/trash"
					component={lazy(() => import("./routes/standard/trash.tsx"))}
				/>

				<Route
					path="/tags"
					component={lazy(() => import("./routes/userland/tag-manager.tsx"))}
				/>
				<Route
					path="/search"
					component={lazy(() => import("./routes/meta/search.tsx"))}
				/>
				<Route
					path="/settings"
					component={lazy(() => import("./routes/meta/settings.tsx"))}
				/>

				<Route
					path="/tags/:tagId"
					component={lazy(() => import("./routes/userland/tag.tsx"))}
				/>
				<Route
					path="/areas/:areaId"
					component={lazy(() => import("./routes/userland/area.tsx"))}
				/>
				<Route
					path="/projects/:projectId"
					component={lazy(() => import("./routes/userland/project.tsx"))}
				/>
				<Route
					path="/logout"
					component={lazy(() => import("./routes/meta/logout.tsx"))}
				/>

				<Route
					path="/*"
					component={lazy(() => import("./routes/meta/404.tsx"))}
				/>
			</Route>
		</Router>
	),
	document.getElementById("app")!
)
