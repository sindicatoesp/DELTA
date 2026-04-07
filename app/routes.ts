import type { RouteConfig } from "@react-router/dev/routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";
import { flatRoutes } from "remix-flat-routes"; // your existing package

export default remixRoutesOptionAdapter((defineRoutes) => {
	const autoRoutes = flatRoutes("routes", defineRoutes, {
		ignoredRouteFiles: [
			"**/.*",
			"settings+/organizations+/**",
			"settings/organizations/**",
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

	return {
		...autoRoutes,
		...organizationsRoutes,
	};
}) satisfies RouteConfig;
