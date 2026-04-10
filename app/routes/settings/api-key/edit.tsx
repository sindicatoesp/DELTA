import {
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useEffect, useState } from "react";

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

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userSession = await requirePermission(
		request,
		PERMISSIONS.API_KEYS_UPDATE,
	);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userRole = await getUserRoleFromSession(request);
	const currentUserId = userSession.user?.id ?? "";

	const data = await makeGetApiKeyFormDataUseCase().execute({
		id: params.id,
		countryAccountsId,
		currentUserId,
		userRole: userRole ?? null,
	});

	if (!data.item) {
		throw new Response("Not Found", { status: 404 });
	}

	return data;
}

export const action = authActionWithPerm(PERMISSIONS.API_KEYS_UPDATE, async (actionArgs) => {
	const auth = authActionGetAuth(actionArgs);
	const { request } = actionArgs;
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const id = actionArgs.params.id;
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

	if (!id) {
		return {
			ok: false as const,
			errors: {
				form: ["Missing API key id"],
			} as Errors<UserCentricApiKeyFields>,
		};
	}

	await makeSaveApiKeyUseCase().execute({
		id,
		countryAccountsId,
		managedByUserId: auth.user?.id || "",
		name,
		assignedToUserId: assignedToUserId || undefined,
	});

	return redirect(API_KEY_SETTINGS_ROUTE);
});

export default function ApiKeysEditPage() {
	const ld = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const selectedItem = ld.item;
	const [name, setName] = useState(selectedItem?.cleanName ?? "");
	const [assignedUserId, setAssignedUserId] = useState(
		selectedItem?.assignedUserId ?? "",
	);
	const errors = actionData && "ok" in actionData && !actionData.ok
		? (actionData.errors as Errors<UserCentricApiKeyFields>)
		: undefined;
	const nameError = firstError(errors?.fields?.name as any);
	const assignedUserError = firstError(errors?.fields?.assignedToUserId as any);

	useEffect(() => {
		setName(selectedItem?.cleanName ?? "");
		setAssignedUserId(selectedItem?.assignedUserId ?? "");
	}, [selectedItem?.cleanName, selectedItem?.assignedUserId]);

	return (
		<ApiKeyDialog
			mode="edit"
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