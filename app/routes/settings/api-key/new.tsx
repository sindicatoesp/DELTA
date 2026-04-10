import {
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";

import { type UserCentricApiKeyFields } from "~/backend.server/models/api_key";
import { firstError, type Errors } from "~/frontend/form";
import { PERMISSIONS } from "~/frontend/user/roles";
import {
	authActionGetAuth,
	authActionWithPerm,
	requirePermission,
} from "~/utils/auth";
import {
	getCountryAccountsIdFromSession,
	getUserRoleFromSession,
} from "~/utils/session";
import {
	makeGetApiKeyFormDataUseCase,
	makeSaveApiKeyUseCase,
} from "~/modules/api-keys/api-keys-module.server";
import ApiKeyDialog from "~/modules/api-keys/presentation/api-key-dialog";

const API_KEY_SETTINGS_ROUTE = "/settings/api-key";

export async function loader({ request }: LoaderFunctionArgs) {
	const userSession = await requirePermission(
		request,
		PERMISSIONS.API_KEYS_CREATE,
	);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userRole = await getUserRoleFromSession(request);
	const currentUserId = userSession.user?.id ?? "";

	return makeGetApiKeyFormDataUseCase().execute({
		countryAccountsId,
		currentUserId,
		userRole: userRole ?? null,
	});
}

export const action = authActionWithPerm(PERMISSIONS.API_KEYS_CREATE, async (actionArgs) => {
	const auth = authActionGetAuth(actionArgs);
	const { request } = actionArgs;
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const formData = await request.formData();
	const name = String(formData.get("name") ?? "").trim();
	const assignedToUserId = String(formData.get("assignedToUserId") ?? "").trim();

	const errors: Errors<UserCentricApiKeyFields> = { fields: {} };
	if (!name) {
		errors.fields!.name = ["Name is required"];
	}

	if (errors.fields && Object.keys(errors.fields).length > 0) {
		return {
			ok: false as const,
			errors,
		};
	}

	await makeSaveApiKeyUseCase().execute({
		id: "",
		countryAccountsId,
		managedByUserId: auth.user?.id || "",
		name,
		assignedToUserId: assignedToUserId || undefined,
	});

	return redirect(API_KEY_SETTINGS_ROUTE);
});

export default function ApiKeysNewPage() {
	const ld = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const [name, setName] = useState("");
	const [assignedUserId, setAssignedUserId] = useState("");
	const errors = actionData && "ok" in actionData && !actionData.ok
		? (actionData.errors as Errors<UserCentricApiKeyFields>)
		: undefined;
	const nameError = firstError(errors?.fields?.name as any);
	const assignedUserError = firstError(errors?.fields?.assignedToUserId as any);

	return (
		<ApiKeyDialog
			mode="create"
			name={name}
			nameError={typeof nameError === "string" ? nameError : nameError?.message}
			selectedUserId={assignedUserId}
			selectedUserError={
				typeof assignedUserError === "string"
					? assignedUserError
					: assignedUserError?.message
			}
			userOptions={ld.userOptions || []}
			isAdmin={ld.isAdmin || false}
			isSubmitting={isSubmitting}
			onNameChange={setName}
			onAssignedUserChange={setAssignedUserId}
			onCancel={() => navigate(API_KEY_SETTINGS_ROUTE)}
		/>
	);
}