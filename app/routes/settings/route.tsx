import { Outlet, redirect, useLoaderData } from "react-router";

import { authLoader } from "~/utils/auth";
import { NavSettings } from "~/frontend/components/nav-settings";



export const loader = authLoader(async (loaderArgs) => {
	const url = new URL(loaderArgs.request.url);

	if (url.pathname === "/settings" || url.pathname === "/settings/") {
		return redirect("/settings/system", 303);
	}

	const isSettingsPage =
		url.pathname.startsWith("/settings") &&
		!url.pathname.startsWith("/settings/");

	return {
		isSettingsPage,
	};
});

export default function SettingsLayout() {
	const ld = useLoaderData<typeof loader>();


	return (
		<>
			{/* Render NavSettings dynamically */}
			{ld.isSettingsPage && <NavSettings />}
			<Outlet />
		</>
	);
}
