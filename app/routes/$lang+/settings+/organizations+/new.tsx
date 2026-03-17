import { useEffect, useMemo, useState } from "react";
import { Form, useActionData, useLocation, useNavigate, useNavigation } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import { BackendContext } from "~/backend.server/context";
import { OrganizationService } from "~/services/organizationService";
import { authActionWithPerm } from "~/utils/auth";
import { getCountryAccountsIdFromSession, redirectWithMessage } from "~/utils/session";
import { ViewContext } from "~/frontend/context";
import type { OrganizationActionResult } from "~/services/organizationService";

export const action = authActionWithPerm("ManageOrganizations", async (args) => {
	const { request } = args;
	const formData = await request.formData();
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const backendCtx = new BackendContext(args);

	formData.set("intent", "create");

	const result = await OrganizationService.organizationAction({
		backendCtx,
		countryAccountsId,
		formData,
	});

	if (result.ok) {
		return redirectWithMessage(args, "/settings/organizations", {
			type: "success",
			text: backendCtx.t({ code: "common.new_record_created", msg: "New record created" }),
		});
	}

	return result;
});

function getOrganizationsBasePath(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	if (segments[segments.length - 1] === "new") {
		return `/${segments.slice(0, -1).join("/")}`;
	}
	return pathname;
}

export default function OrganizationsNewPage() {
	const ctx = new ViewContext();
	const actionData = useActionData() as OrganizationActionResult | undefined;
	const location = useLocation();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const basePath = useMemo(
		() => getOrganizationsBasePath(location.pathname),
		[location.pathname],
	);
	const [newName, setNewName] = useState("");
	const [nameError, setNameError] = useState("");

	const withCurrentSearch = (path: string) =>
		location.search ? `${path}${location.search}` : path;

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
				header={ctx.t({ code: "organizations.add", msg: "Add organization" })}
				visible
				onHide={() => navigate(withCurrentSearch(basePath))}
				className="w-[32rem] max-w-full"
			>
				<Form method="post" className="flex flex-col">
					<p className="mb-3 text-red-700">* Required information</p>
					<div className="mb-3 flex flex-col gap-2">
						<label htmlFor="create-organization-name">
							<span className="inline-flex gap-1">
								<span>{ctx.t({ code: "common.name", msg: "Name" })}</span>
								<span className="text-red-700">*</span>
							</span>
						</label>
						<InputText
							id="create-organization-name"
							name="name"
							value={newName}
							invalid={!!nameError}
							aria-invalid={nameError ? true : false}
							onChange={(e) => {
								setNewName(e.target.value);
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
						/>
					</div>
				</Form>
			</Dialog>
		</>
	);
}