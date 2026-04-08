import {
	UserCentricApiKeyFields,
} from "~/backend.server/models/api_key";

import { fieldsDef, ApiKeyForm } from "~/frontend/api_key";
import { FormScreen } from "~/frontend/form";
import { formSave } from "~/backend.server/handlers/form/form";
import { route } from "~/frontend/api_key";
import {
	authActionGetAuth,
	authActionWithPerm,
} from "~/utils/auth";
import {
	getCountryAccountsIdFromSession,
	getUserRoleFromSession,
} from "~/utils/session";
import { PERMISSIONS } from "~/frontend/user/roles";
import {
	makeGetApiKeyFormDataUseCase,
	makeSaveApiKeyUseCase,
} from "~/modules/api-keys/api-keys-module.server";
import { requirePermission } from "~/utils/auth";



import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";


export async function loader({ params, request }: LoaderFunctionArgs) {
	const userSession = await requirePermission(request, PERMISSIONS.API_KEYS_EDIT);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userRole = await getUserRoleFromSession(request);
	const currentUserId = userSession.user?.id ?? "";

	const data = await makeGetApiKeyFormDataUseCase().execute({
		id: params.id,
		countryAccountsId,
		currentUserId,
		userRole: userRole ?? null,
	});

	if (params.id && params.id !== "new" && !data.item) {
		throw new Response("Not Found", { status: 404 });
	}

	return data;
}

export const action = authActionWithPerm(PERMISSIONS.API_KEYS_EDIT, async (actionArgs) => {

	const auth = authActionGetAuth(actionArgs);
	const { request } = actionArgs;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);

	return formSave<UserCentricApiKeyFields>({
		actionArgs,
		fieldsDef: fieldsDef(),
		save: async (_tx, id, fields) => {
			const result = await makeSaveApiKeyUseCase().execute({
				id,
				countryAccountsId,
				managedByUserId: auth.user?.id || "",
				name: fields.name,
				assignedToUserId: fields.assignedToUserId || undefined,
			});

			return { ok: true, id: result.id };
		},
		redirectTo: (id) => `${route}/${id}`,
	});
});

export default function Screen() {
	const ld = useLoaderData<typeof loader>();


	const extraData = {
		userOptions: ld.userOptions || [],
		isAdmin: ld.isAdmin || false,
	};

	return (
		<FormScreen
			loaderData={ld}
			formComponent={ApiKeyForm}
			extraData={extraData}
		/>
	);
}
