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
				path="/test"
				component={lazy(() => import("./views/meta/test.tsx"))}
			/>
			<Route
				path="/"
				component={lazy(() => import("./views/meta/intro.tsx"))}
			/>
			<Route component={lazy(() => import("./layouts/chrome.tsx"))}>
				<Route
					path="/today"
					component={lazy(() => import("./views/today/today.tsx"))}
				/>
				<Route
					path="/inbox"
					component={lazy(() => import("./views/standard/inbox.tsx"))}
				/>
				<Route
					path="/dropbox/:dropboxId"
					component={lazy(() => import("./views/userland/dropbox.tsx"))}
				/>

				<Route
					path="/upcoming"
					component={lazy(() => import("./views/upcoming/upcoming.tsx"))}
				/>
				<Route
					path="/anytime"
					component={lazy(() => import("./views/standard/anytime.tsx"))}
				/>
				<Route
					path="/someday"
					component={lazy(() => import("./views/standard/someday.tsx"))}
				/>

				<Route
					path="/logbook"
					component={lazy(() => import("./views/standard/logbook.tsx"))}
				/>

				<Route
					path="/trash"
					component={lazy(() => import("./views/standard/trash.tsx"))}
				/>

				<Route
					path="/tags"
					component={lazy(() => import("./views/userland/tag-manager.tsx"))}
				/>
				<Route
					path="/search"
					component={lazy(() => import("./views/meta/search.tsx"))}
				/>
				<Route
					path="/settings"
					component={lazy(() => import("./views/meta/settings.tsx"))}
				/>

				<Route
					path="/tags/:tagId"
					component={lazy(() => import("./views/userland/tag.tsx"))}
				/>
				<Route
					path="/areas/:areaId"
					component={lazy(() => import("./views/userland/area.tsx"))}
				/>
				<Route
					path="/projects/:projectId"
					component={lazy(() => import("./views/userland/project/project.tsx"))}
				/>
				<Route
					path="/logout"
					component={lazy(() => import("./views/meta/logout.tsx"))}
				/>

				<Route
					path="/*"
					component={lazy(() => import("./views/meta/404.tsx"))}
				/>
			</Route>
		</Router>
	),
	document.getElementById("app")!
)
