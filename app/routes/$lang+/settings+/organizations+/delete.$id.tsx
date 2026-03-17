import { useEffect, useMemo } from "react";
import { Form, useActionData, useLoaderData, useLocation, useNavigate, useNavigation } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { BackendContext } from "~/backend.server/context";
import { OrganizationRepository } from "~/db/queries/organizationRepository";
import { OrganizationService } from "~/services/organizationService";
import { authActionWithPerm, authLoaderPublicOrWithPerm } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";
import { ViewContext } from "~/frontend/context";
import type { OrganizationActionResult } from "~/services/organizationService";

export const loader = authLoaderPublicOrWithPerm(
	"ManageOrganizations",
	async (loaderArgs) => {
		const { request } = loaderArgs;
		const countryAccountsId = (await getCountryAccountsIdFromSession(request))!;
		const selectedOrganization =
			(await OrganizationRepository.getByIdAndCountryAccountsId(
				loaderArgs.params.id!,
				countryAccountsId,
			)) ?? null;

		if (!selectedOrganization) {
			throw new Response("Not Found", { status: 404 });
		}

		return { selectedOrganization };
	},
);

export const action = authActionWithPerm("ManageOrganizations", async (args) => {
	const { request } = args;
	const formData = await request.formData();
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const backendCtx = new BackendContext(args);

	formData.set("intent", "delete");
	if (args.params.id) {
		formData.set("id", args.params.id);
	}

	const result = await OrganizationService.organizationAction({
		backendCtx,
		countryAccountsId,
		formData,
	});

	if (result.ok) {
		return redirectWithMessage(args, "/settings/organizations", {
			type: "success",
			text: backendCtx.t({ code: "common.record_deleted", msg: "Record deleted" }),
		});
	}

	return result;
});

function getOrganizationsBasePath(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length >= 2 && segments[segments.length - 2] === "delete") {
		return `/${segments.slice(0, -2).join("/")}`;
	}
	return pathname;
}

export default function OrganizationsDeletePage() {
	const ld = useLoaderData<typeof loader>();
	const ctx = new ViewContext();
	const actionData = useActionData() as OrganizationActionResult | undefined;
	const location = useLocation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const basePath = useMemo(
		() => getOrganizationsBasePath(location.pathname),
		[location.pathname],
	);
	const selectedItem = ld.selectedOrganization ?? undefined;

	const withCurrentSearch = (path: string) =>
		location.search ? `${path}${location.search}` : path;

	useEffect(() => {
		if (actionData?.ok) {
			navigate(withCurrentSearch(basePath));
		}
	}, [actionData, basePath, navigate]);

	return (
		<>
			<Dialog
				header={ctx.t({ code: "common.record_deletion", msg: "Record Deletion" })}
				visible
				onHide={() => navigate(withCurrentSearch(basePath))}
				className="w-[30rem] max-w-full"
			>
				<Form method="post">
					<p>
						{ctx.t({
							code: "common.confirm_deletion",
							msg: "Please confirm deletion.",
						})}
					</p>
					{selectedItem?.name ? <p>{selectedItem.name}</p> : null}
					<div className="mt-4 flex justify-end gap-2">
						<Button
							type="button"
							outlined
							label={ctx.t({ code: "common.cancel", msg: "Cancel" })}
							onClick={() => navigate(withCurrentSearch(basePath))}
						/>
						<Button
							type="submit"
							severity="danger"
							label={ctx.t({ code: "common.delete", msg: "Delete" })}
							loading={navigation.state !== "idle"}
							disabled={!selectedItem}
						/>
					</div>
				</Form>
			</Dialog>
		</>
	);
}