import { ActionFunctionArgs, redirect } from "react-router";

import { logout } from "~/utils/auth";

export const action = async (actionArgs: ActionFunctionArgs) => {
	const { request } = actionArgs;

	try {
		const headers = await logout(request);
		const url = new URL(request.url);
		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo && redirectTo.startsWith("/")) {
			return redirect(redirectTo, { headers });
		}
		return redirect("/", { headers });
	} catch (error) {
		return redirect("/user/login/");
	}
};
