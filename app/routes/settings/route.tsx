import { Outlet, redirect } from "react-router";

import { authLoader } from "~/utils/auth";

export const loader = authLoader(async (loaderArgs) => {
	const url = new URL(loaderArgs.request.url);

	if (url.pathname === "/settings" || url.pathname === "/settings/") {
		return redirect("/settings/system", 303);
	}

	return null;
});

export default function SettingsLayout() {
	return <Outlet />;
}
