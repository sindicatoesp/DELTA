import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";

import { PERMISSIONS, roleHasPermission } from "~/frontend/user/roles";
import ApiKeyManagementPage from "~/modules/api-keys/presentation/api-keys-page";
import { makeListApiKeysUseCase } from "~/modules/api-keys/api-keys-module.server";
import { requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, getUserRoleFromSession } from "~/utils/session";

export async function loader({ request }: LoaderFunctionArgs) {
	await requirePermission(request, PERMISSIONS.API_KEYS_LIST);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userRole = await getUserRoleFromSession(request);
	const url = new URL(request.url);
	const pageRaw = parseInt(url.searchParams.get("page") || "1", 10);
	const pageSizeRaw = parseInt(url.searchParams.get("pageSize") || "50", 10);
	const page = Math.max(1, Number.isNaN(pageRaw) ? 1 : pageRaw);
	const pageSize = Math.max(1, Number.isNaN(pageSizeRaw) ? 50 : pageSizeRaw);

	const data = await makeListApiKeysUseCase().execute({
		countryAccountsId,
		page,
		pageSize,
	});

	const canCreate = roleHasPermission(userRole, PERMISSIONS.API_KEYS_CREATE);
	const canUpdate = roleHasPermission(userRole, PERMISSIONS.API_KEYS_UPDATE);
	const canDelete = roleHasPermission(userRole, PERMISSIONS.API_KEYS_DELETE);

	return {
		apiKeys: data,
		canCreate,
		canUpdate,
		canDelete,
		userRole: userRole ?? null,
	};
}

export default function ApiKeysPage() {
	const { apiKeys, canCreate, canUpdate, canDelete, userRole } =
		useLoaderData<typeof loader>();

	return (
		<>
			<ApiKeyManagementPage
				apiKeys={apiKeys}
				canCreate={canCreate}
				canUpdate={canUpdate}
				canDelete={canDelete}
				userRole={userRole}
			/>
			<Outlet />
		</>
	);
}