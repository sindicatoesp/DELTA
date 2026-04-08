import type { ActionFunction } from "react-router";
import { redirect } from "react-router";
import { superAdminSessionCookie } from "~/utils/session";

// Handle both GET and POST requests for logout
// export const loader = async (loaderArgs: LoaderFunctionArgs) => {
// 	return await handleLogout(loaderArgs);
// };

export const action: ActionFunction = async (actionArgs) => {
	return await handleLogout(actionArgs);
};

async function handleLogout(routeArgs: {
	request: Request;
	params?: { lang?: string };
}) {
	const { request } = routeArgs;
	const session = await superAdminSessionCookie().getSession(
		request.headers.get("Cookie"),
	);
	// Destroy ONLY the super admin session cookie, leaving regular user sessions intact
	return redirect("/admin/login", {
		headers: {
			"Set-Cookie": await superAdminSessionCookie().destroySession(session),
		},
	});
}
