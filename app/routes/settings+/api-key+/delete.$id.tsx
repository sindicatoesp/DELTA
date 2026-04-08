import { PERMISSIONS } from "~/frontend/user/roles";
import { route } from "~/frontend/api_key";
import { makeDeleteApiKeyUseCase } from "~/modules/api-keys/api-keys-module.server";
import { authActionWithPerm } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";

export const action = authActionWithPerm(PERMISSIONS.API_KEYS_EDIT, async (args) => {
	const id = args.params.id ?? "";
	const countryAccountsId = await getCountryAccountsIdFromSession(args.request);

	const deleted = await makeDeleteApiKeyUseCase().execute({
		id,
		countryAccountsId,
	});

	if (!deleted) {
		throw new Response("Not Found", { status: 404 });
	}

	return redirectWithMessage(args, route, {
		type: "success",
		text: "Record deleted",
	});
});
