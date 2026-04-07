import { useState } from "react";
import { useActionData, useNavigate, useNavigation } from "react-router";

import { PERMISSIONS } from "~/frontend/user/roles";
import NewOrganizationDialog from "~/modules/organizations/presentation/new-organization-dialog";
import { makeCreateOrganizationUseCase } from "~/modules/organizations/organization-module.server";
import { authActionWithPerm } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";

export const action = authActionWithPerm(PERMISSIONS.ORGANIZATIONS_CREATE, async (args) => {
	const { request } = args;
	const formData = await request.formData();
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const name = String(formData.get("name") || "").trim();

	const result = await makeCreateOrganizationUseCase().execute({
		countryAccountsId,
		name,
	});

	if (result.ok) {
		return redirectWithMessage(args, "/settings/organizations", {
			type: "success",
			text: "New record created",
		});
	}

	return result;
});

export default function OrganizationsNewPage() {
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const nameError = actionData && !actionData.ok ? actionData.error : "";
	const [newName, setNewName] = useState("");

	return (
		<NewOrganizationDialog
			name={newName}
			nameError={nameError}
			isSubmitting={isSubmitting}
			onNameChange={setNewName}
			onCancel={() => navigate("/settings/organizations")}
		/>
	);
}
