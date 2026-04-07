import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";

import { PERMISSIONS } from "~/frontend/user/roles";
import EditOrganizationDialog from "~/modules/organizations/presentation/edit-organization-dialog";
import {
    makeGetOrganizationByIdUseCase,
    makeUpdateOrganizationUseCase,
} from "~/modules/organizations/organization-module.server";
import { authActionWithPerm, requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";

export async function loader(loaderArgs: LoaderFunctionArgs) {
    await requirePermission(loaderArgs.request, PERMISSIONS.ORGANIZATIONS_UPDATE);
    const { request, params } = loaderArgs;
    const countryAccountsId = (await getCountryAccountsIdFromSession(request))!;
    const id = params.id ?? "";
    const selectedOrganization = await makeGetOrganizationByIdUseCase().execute({
        id,
        countryAccountsId,
    });

    if (!selectedOrganization) {
        throw new Response("Not Found", { status: 404 });
    }

    return { selectedOrganization };
}

export const action = authActionWithPerm(PERMISSIONS.ORGANIZATIONS_UPDATE, async (args) => {
    const { request } = args;
    const formData = await request.formData();
    const countryAccountsId = await getCountryAccountsIdFromSession(request);
    const id = args.params.id ?? "";
    const name = String(formData.get("name") || "").trim();

    const result = await makeUpdateOrganizationUseCase().execute({
        countryAccountsId,
        id,
        name,
    });

    if (result.ok) {
        return redirectWithMessage(args, "/settings/organizations", {
            type: "success",
            text: "Changes saved",
        });
    }

    return result;
});

export default function OrganizationsEditPage() {
    const ld = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const selectedItem = ld.selectedOrganization;
    const nameError = actionData && !actionData.ok ? actionData.error : "";
    const [editName, setEditName] = useState(selectedItem?.name ?? "");

    return (
        <EditOrganizationDialog
            name={editName}
            nameError={nameError}
            isSubmitting={isSubmitting}
            onNameChange={setEditName}
            onCancel={() => navigate("/settings/organizations")}
        />
    );
}
