import { makeListHazardousEventsUseCase } from "~/modules/hazardous-event/hazardous-event-module.server";
import HazardousEventsManagementPage from "~/modules/hazardous-event/presentation/hazardous-events-management-page";
import { PERMISSIONS, roleHasPermission } from "~/frontend/user/roles";

import { MetaFunction, Outlet, useLoaderData } from "react-router";

import { authLoaderPublicOrWithPerm } from "~/utils/auth";
import { getUserRoleFromSession } from "~/utils/session";

import { htmlTitle } from "~/utils/htmlmeta";

export const meta: MetaFunction = () => {


	return [
		{
			title: htmlTitle(
				"List of hazardous events",
			),
		},
		{
			name: "description",
			content: "Hazardous events",
		},
	];
};

export const loader = authLoaderPublicOrWithPerm("ViewData", async (args) => {
	const listData = await makeListHazardousEventsUseCase().execute({ args });
	const userRole = await getUserRoleFromSession(args.request);

	return {
		...listData,
		canCreate:
			!listData.isPublic &&
			roleHasPermission(userRole, PERMISSIONS.DATA_EDIT),
		canUpdate:
			!listData.isPublic &&
			roleHasPermission(userRole, PERMISSIONS.DATA_EDIT),
		canDelete:
			!listData.isPublic &&
			roleHasPermission(userRole, PERMISSIONS.VALIDATED_DATA_DELETE),
		userRole: userRole ?? null,
	};
});

export default function Data() {
	const ld = useLoaderData<typeof loader>();

	return (
		<>
			<HazardousEventsManagementPage
				instanceName={ld.instanceName}
				isPublic={ld.isPublic}
				filters={ld.filters}
				hip={ld.hip}
				organizations={ld.organizations}
				data={ld.data}
				canCreate={ld.canCreate}
				canUpdate={ld.canUpdate}
				canDelete={ld.canDelete}
				userRole={ld.userRole}
			/>
			<Outlet />
		</>
	);
}
