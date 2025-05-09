/* @refresh reload */
import "temporal-polyfill/global"
import {lazy} from "solid-js"
import {render} from "solid-js/web"
import {Route, Router} from "@solidjs/router"
import App from "./layouts/app.tsx"
import "./styles/themes/themes.ts"

// todo
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API#browser_compatibility

render(
	() => (
		<Router root={App}>
			<Route path="/share" component={() => "not implemented"} />

			<Route
				path="/"
				component={lazy(() => import("./pages/meta/intro.tsx"))}
			/>
			<Route component={lazy(() => import("./layouts/chrome.tsx"))}>
				<Route
					path="/today"
					component={lazy(() => import("./pages/today/today.tsx"))}
				/>
				<Route
					path="/inbox"
					component={lazy(() => import("./pages/standard/inbox.tsx"))}
				/>
				<Route
					path="/dropbox/:dropboxId"
					component={lazy(() => import("./pages/userland/dropbox.tsx"))}
				/>

				<Route
					path="/upcoming"
					component={lazy(() => import("./pages/upcoming/upcoming.tsx"))}
				/>
				<Route
					path="/anytime"
					component={lazy(() => import("./pages/standard/anytime.tsx"))}
				/>
				<Route
					path="/someday"
					component={lazy(() => import("./pages/standard/someday.tsx"))}
				/>

				<Route
					path="/logbook"
					component={lazy(() => import("./pages/standard/logbook.tsx"))}
				/>

				<Route
					path="/trash"
					component={lazy(() => import("./pages/standard/trash.tsx"))}
				/>

				<Route
					path="/tags"
					component={lazy(() => import("./pages/userland/tag-manager.tsx"))}
				/>
				<Route
					path="/search"
					component={lazy(() => import("./pages/meta/search.tsx"))}
				/>
				<Route
					path="/settings"
					component={lazy(() => import("./pages/meta/settings.tsx"))}
				/>

				<Route
					path="/tags/:tagId"
					component={lazy(() => import("./pages/userland/tag.tsx"))}
				/>
				<Route
					path="/areas/:areaId"
					component={lazy(() => import("./pages/userland/area.tsx"))}
				/>
				<Route
					path="/projects/:projectId"
					component={lazy(() => import("./pages/userland/project.tsx"))}
				/>
				<Route
					path="/logout"
					component={lazy(() => import("./pages/meta/logout.tsx"))}
				/>

				<Route
					path="/*"
					component={lazy(() => import("./pages/meta/404.tsx"))}
				/>
			</Route>
		</Router>
	),
	document.body!
)
