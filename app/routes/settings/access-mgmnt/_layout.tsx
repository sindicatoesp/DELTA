import { MetaFunction, Outlet } from "react-router";
import { makeListAccessManagementUseCase } from "~/modules/access-management/access-management-module.server";
import { authLoaderWithPerm } from "~/utils/auth";
import {
	getCountryAccountsIdFromSession,
	getUserRoleFromSession
} from "~/utils/session";

import { htmlTitle } from "~/utils/htmlmeta";
import AccessManagementPage from "~/pages/AccessManagementPage";

export const meta: MetaFunction = () => {


	return [
		{
			title: htmlTitle(
				"Access Management",
			),
		},
		{
			name: "description",
			content: "Access Management",
		},
	];
};

export const loader = authLoaderWithPerm("ViewUsers", async (loaderArgs) => {
	const { request } = loaderArgs;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userRole = await getUserRoleFromSession(request);

	return makeListAccessManagementUseCase().execute({
		request,
		countryAccountsId,
		userRole: userRole ?? null,
	});
});

export default function AccessManagementLayout() {
	return (
		<>
			<AccessManagementPage />
			<Outlet />
		</>
	);
}
