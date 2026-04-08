import { ApiKeyView } from "~/frontend/api_key";

import { PERMISSIONS } from "~/frontend/user/roles";
import { makeGetApiKeyByIdUseCase } from "~/modules/api-keys/api-keys-module.server";
import { requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession } from "~/utils/session";



import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";


export async function loader({ params, request }: LoaderFunctionArgs) {
	const userSession = await requirePermission(request, PERMISSIONS.API_KEYS_EDIT);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const id = params.id ?? "";
	const currentUserId = userSession.user?.id ?? "";

	const item = await makeGetApiKeyByIdUseCase().execute({
		id,
		countryAccountsId,
		requestingUserId: currentUserId,
	});
	if (!item) {
		throw new Response("Not Found", { status: 404 });
	}

	return {
		item,
	};
}

export default function Screen() {
	const ld = useLoaderData<typeof loader>();
	if (!ld.item) {
		throw new Error("no item");
	}

	return ApiKeyView({
		item: ld.item as any,
	});
}
