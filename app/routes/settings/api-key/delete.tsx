import type { LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";

import { PERMISSIONS } from "~/frontend/user/roles";
import { route } from "~/frontend/api_key";
import DeleteApiKeyDialog from "~/modules/api-keys/presentation/delete-api-key-dialog";
import {
    makeDeleteApiKeyUseCase,
    makeGetApiKeyByIdUseCase,
} from "~/modules/api-keys/api-keys-module.server";
import { authActionWithPerm, requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";

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

    return { item };
}

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

export default function ApiKeysDeletePage() {
    const ld = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as { error?: string } | undefined;
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const actionError = actionData?.error;

    return (
        <DeleteApiKeyDialog
            name={ld.item.cleanName || ld.item.name}
            error={actionError}
            isSubmitting={isSubmitting}
            onCancel={() => navigate(route)}
        />
    );
}