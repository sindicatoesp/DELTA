import { ActionFunctionArgs } from "react-router";

import { logout } from "~/utils/auth";
import { redirectLangFromRoute } from "~/utils/url.backend";

export const action = async (actionArgs: ActionFunctionArgs) => {
	const { request } = actionArgs;

	try {
		const headers = await logout(request);
		return redirectLangFromRoute(actionArgs, "/", { headers });
	} catch (error) {
		return redirectLangFromRoute(actionArgs, "/user/login/");
	}
};
