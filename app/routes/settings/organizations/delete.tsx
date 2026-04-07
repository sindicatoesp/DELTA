import type { LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";

import { PERMISSIONS } from "~/frontend/user/roles";
import DeleteOrganizationDialog from "~/modules/organizations/presentation/delete-organization-dialog";
import {
    makeDeleteOrganizationUseCase,
    makeGetOrganizationByIdUseCase,
} from "~/modules/organizations/organization-module.server";
import { authActionWithPerm, requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";

export async function loader(loaderArgs: LoaderFunctionArgs) {
    await requirePermission(loaderArgs.request, PERMISSIONS.ORGANIZATIONS_DELETE);
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

export const action = authActionWithPerm(PERMISSIONS.ORGANIZATIONS_DELETE, async (args) => {
    const { request } = args;
    const countryAccountsId = await getCountryAccountsIdFromSession(request);
    const id = args.params.id ?? "";

    const result = await makeDeleteOrganizationUseCase().execute({
        countryAccountsId,
        id,
    });

    if (result.ok) {
        return redirectWithMessage(args, "/settings/organizations", {
            type: "success",
            text: "Record deleted",
        });
    }

    return result;
});

export default function OrganizationsDeletePage() {
    const ld = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const selectedItem = ld.selectedOrganization;
    const actionError = actionData && !actionData.ok ? actionData.error : undefined;

    return (
        <DeleteOrganizationDialog
            name={selectedItem?.name ?? ""}
            error={actionError}
            isSubmitting={isSubmitting}
            onCancel={() => navigate("/settings/organizations")}
        />
    );
}
