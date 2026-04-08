import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";

import { PERMISSIONS, roleHasPermission } from "~/frontend/user/roles";
import OrganizationManagementPage from "~/modules/organizations/presentation/organizations-page";
import { makeListOrganizationsUseCase } from "~/modules/organizations/organization-module.server";
import { requirePermission } from "~/utils/auth";
import { getCountryAccountsIdFromSession, getUserRoleFromSession } from "~/utils/session";

export async function loader({ request }: LoaderFunctionArgs) {
	await requirePermission(
		request,
		PERMISSIONS.ORGANIZATIONS_LIST,
	);
	const countryAccountsId = (await getCountryAccountsIdFromSession(request))!;

	const url = new URL(request.url);
	const pageRaw = parseInt(url.searchParams.get("page") || "1", 10);
	const pageSizeRaw = parseInt(url.searchParams.get("pageSize") || "50", 10);
	const page = Math.max(1, Number.isNaN(pageRaw) ? 1 : pageRaw);
	const pageSize = Math.max(1, Number.isNaN(pageSizeRaw) ? 50 : pageSizeRaw);
	const search = (url.searchParams.get("search") || "").trim();

	const { filters, data: organizations } =
		await makeListOrganizationsUseCase().execute({
			countryAccountsId,
			page,
			pageSize,
			search,
		});
	const userRole = await getUserRoleFromSession(request);
	const canCreate = roleHasPermission(userRole, PERMISSIONS.ORGANIZATIONS_CREATE);
	const canUpdate = roleHasPermission(userRole, PERMISSIONS.ORGANIZATIONS_UPDATE);
	const canDelete = roleHasPermission(userRole, PERMISSIONS.ORGANIZATIONS_DELETE);

	return {
		organizations,
		filters,
		canCreate,
		canUpdate,
		canDelete,
		userRole: userRole ?? null,
	};
}

export default function OrganizationsPage() {
	const { organizations, filters, canCreate, canUpdate, canDelete, userRole } =
		useLoaderData<typeof loader>();

	return (
		<>
			<OrganizationManagementPage
				organizations={organizations}
				filters={filters}
				canCreate={canCreate}
				canUpdate={canUpdate}
				canDelete={canDelete}
				userRole={userRole}
			/>
			<Outlet />
		</>
	);
}
