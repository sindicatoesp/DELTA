import type { RouteConfig } from "@react-router/dev/routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";
import { flatRoutes } from "remix-flat-routes"; // your existing package

export default remixRoutesOptionAdapter((defineRoutes) => {
	const autoRoutes = flatRoutes("routes", defineRoutes, {
		ignoredRouteFiles: [
			"**/.*",
			"settings+/organizations+/**",
			"settings/organizations/**",
			"settings+/api-key+/**",
			"settings/api-key/**",
			"settings+/system.tsx",
			"settings/system.tsx",
			"settings/system/**",
			"user+/profile+/**",
		],
	});

	const organizationsRoutes = defineRoutes((route) => {
		route(
			"settings/organizations",
			"routes/settings/organizations/index.tsx",
			() => {
				route("new", "routes/settings/organizations/new.tsx");
				route(":id/edit", "routes/settings/organizations/edit.tsx");
				route(":id/delete", "routes/settings/organizations/delete.tsx");
			},
		);
	});

	const apiKeyRoutes = defineRoutes((route) => {
		route("settings/api-key", "routes/settings/api-key/index.tsx", () => {
			route("new", "routes/settings/api-key/new.tsx");
			route(":id/edit", "routes/settings/api-key/edit.tsx");
			route(":id/delete", "routes/settings/api-key/delete.tsx");
		});
	});

	const systemSettingsRoutes = defineRoutes((route) => {
		route("settings/system", "routes/settings/system/index.tsx", () => {
			route("edit", "routes/settings/system/edit.tsx");
		});
	});

	const userProfileRoutes = defineRoutes((route) => {
		route("user/profile", "routes/user+/profile+/_layout.tsx", () => {
			route("", "routes/user+/profile+/_index.tsx");
			route("edit", "routes/user+/profile+/edit.tsx");
		});
	});

	return {
		...autoRoutes,
		...organizationsRoutes,
		...apiKeyRoutes,
		...systemSettingsRoutes,
		...userProfileRoutes,
	};
}) satisfies RouteConfig;
