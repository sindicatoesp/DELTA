import { useEffect, useMemo, useState } from "react";
import { Form, useActionData, useLoaderData, useLocation, useNavigate, useNavigation } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

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

	formData.set("intent", "update");
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
			text: backendCtx.t({ code: "common.changes_saved", msg: "Changes saved" }),
		});
	}

	return result;
});

function getOrganizationsBasePath(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length >= 2 && segments[segments.length - 2] === "edit") {
		return `/${segments.slice(0, -2).join("/")}`;
	}
	return pathname;
}

export default function OrganizationsEditPage() {
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
	const [editName, setEditName] = useState(selectedItem?.name ?? "");
	const [nameError, setNameError] = useState("");

	const withCurrentSearch = (path: string) =>
		location.search ? `${path}${location.search}` : path;

	useEffect(() => {
		setEditName(selectedItem?.name ?? "");
		setNameError("");
	}, [selectedItem?.id, selectedItem?.name]);

	useEffect(() => {
		if (!actionData) {
			return;
		}

		if (actionData.ok) {
			navigate(withCurrentSearch(basePath));
			return;
		}

		if (actionData.error.toLowerCase().includes("name")) {
			setNameError(actionData.error);
		}
	}, [actionData, basePath, navigate]);

	return (
		<>
			<Dialog
				header={ctx.t({ code: "organizations.edit", msg: "Edit organization" })}
				visible
				onHide={() => navigate(withCurrentSearch(basePath))}
				className="w-[32rem] max-w-full"
			>
				<Form method="post" className="flex flex-col">
					<p className="mb-3 text-red-700">* Required information</p>
					<div className="mb-3 flex flex-col gap-2">
						<label htmlFor="edit-organization-name">
							<span className="inline-flex gap-1">
								<span>{ctx.t({ code: "common.name", msg: "Name" })}</span>
								<span className="text-red-700">*</span>
							</span>
						</label>
						<InputText
							id="edit-organization-name"
							name="name"
							value={editName}
							invalid={!!nameError}
							aria-invalid={nameError ? true : false}
							onChange={(e) => {
								setEditName(e.target.value);
								if (e.target.value.trim()) {
									setNameError("");
								}
							}}
						/>
						{nameError ? <small className="text-red-700">{nameError}</small> : null}
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button
							type="button"
							outlined
							label={ctx.t({ code: "common.cancel", msg: "Cancel" })}
							onClick={() => navigate(withCurrentSearch(basePath))}
						/>
						<Button
							type="submit"
							label={ctx.t({ code: "common.save", msg: "Save" })}
							loading={navigation.state !== "idle"}
							disabled={!selectedItem}
						/>
					</div>
				</Form>
			</Dialog>
		</>
	);
}