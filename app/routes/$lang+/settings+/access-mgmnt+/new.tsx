import { MetaFunction, useNavigation } from "react-router";

import { useLoaderData, useActionData, Form } from "react-router";
import { useState } from "react";

import { getCountryRole, getCountryRoles } from "~/frontend/user/roles";

import { authActionWithPerm, authLoaderWithPerm } from "~/utils/auth";

import {
	getCountrySettingsFromSession,
	getCountryAccountsIdFromSession,
	getUserFromSession,
	redirectWithMessage,
} from "~/utils/session";

import { MainContainer } from "~/frontend/container";

import "react-toastify/dist/ReactToastify.css";
import { getCountryAccountById } from "~/db/queries/countryAccounts";
import { LangLink } from "~/utils/link";

import { ViewContext } from "~/frontend/context";
import { BackendContext } from "~/backend.server/context";
import { htmlTitle } from "~/utils/htmlmeta";
import { getAllOrganizationsByCountryAccountsId } from "~/db/queries/organization";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { isValidEmail } from "~/utils/email";
import { createUser, getUserByEmail, updateUserById } from "~/db/queries/user";
import { createUserCountryAccounts, doesUserCountryAccountExistByEmailAndCountryAccountsId } from "~/db/queries/userCountryAccounts";
import { randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { sendInviteForExistingUser2, sendInviteForNewUser2 } from "~/utils/emailUtil";
import { dr } from "~/db.server";

export const meta: MetaFunction = () => {
	const ctx = new ViewContext();

	return [
		{
			title: htmlTitle(
				ctx,
				ctx.t({
					code: "meta.adding_new_user",
					msg: "Adding New User",
				}),
			),
		},
		{
			name: "description",
			content: ctx.t({
				code: "meta.invite_user",
				msg: "Invite User",
			}),
		},
	];
};

export const loader = authLoaderWithPerm("InviteUsers", async (args) => {
	const { request } = args;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const organizations = await getAllOrganizationsByCountryAccountsId(countryAccountsId);

	return {
		organizations
	};
});

export const action = authActionWithPerm("InviteUsers", async (actionArgs) => {
	const { request } = actionArgs;
	const loggedInUser = await getUserFromSession(request);

	const errors: Record<string, string> = {};
	const formData = await request.formData();
	const email = formData.get("email") as string;
	let organization = formData.get("organization") as string | null;
	const role = formData.get("role") as string;

	organization = organization && organization.trim() !== ""
		? organization
		: null;

	if (!email || email.trim() === "") {
		errors.email = "Email is required";
	} else if (!isValidEmail(email)) {
		errors.email = "Invalid email format.";
	} else if (email.toLowerCase() === loggedInUser?.user.email.toLowerCase()) {
		errors.email = "You cannot use your own email."
	}

	if (!role || role.trim() === "") {
		errors.role = "Role is required"
	}

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const isEmailAlreadyInvited = await doesUserCountryAccountExistByEmailAndCountryAccountsId(email, countryAccountsId);
	if (isEmailAlreadyInvited) {
		errors.email = "Email already invited."
	}

	if (Object.keys(errors).length > 0) {
		return { ok: false, errors }
	}

	const ctx = new BackendContext(actionArgs);
	const countrySettings = await getCountrySettingsFromSession(request);
	const countryAccount = await getCountryAccountById(countryAccountsId);
	const countryAccountType = countryAccount?.type || "[null]"

	//Add new user if not exist
	let user = await getUserByEmail(email);
	if (!user) {
		await dr.transaction(async (tx) => {
			user = await createUser(
				email,
			);
			const inviteCode = randomBytes(32).toString("hex");
			const expirationTime = addHours(new Date(), 7 * 24);

			updateUserById(user.id, {
				inviteSentAt: new Date(),
				inviteCode: inviteCode,
				inviteExpiresAt: expirationTime,
			},
				tx)

			await createUserCountryAccounts({
				userId: user.id,
				countryAccountsId,
				role,
				isPrimaryAdmin: false,
				organizationId: organization
			},
				tx
			);
			sendInviteForNewUser2(ctx, user, countrySettings.websiteName, role, countrySettings.countryName, countryAccountType, inviteCode);
		});
	} else {
		await createUserCountryAccounts({
			userId: user.id,
			countryAccountsId,
			role,
			isPrimaryAdmin: false,
			organizationId: organization
		}
		);
		sendInviteForExistingUser2(ctx, user, countrySettings.websiteName, role, countrySettings.countryName, countryAccountType);
	}

	return redirectWithMessage(actionArgs, "/settings/access-mgmnt/", {
		type: "info",
		text: ctx.t({
			code: "settings.access_mgmnt.user_added_successfully",
			msg: "User has been successfully added!",
		}),
	});
});

export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();
	const ctx = new ViewContext();
	const actionData = useActionData<typeof action>();
	const errors = actionData?.errors;
	const roles = getCountryRoles(ctx);

	const navigation = useNavigation();
	const isSubmitting =
		navigation.state === "submitting";

	const [selectedRole, setSelectedRole] = useState("");
	const [selectedOrganization, setSelectedOrganization] = useState("");

	const roleObj = getCountryRole(ctx, selectedRole);

	return (
		<MainContainer
			title={ctx.t({ code: "settings.access_mgmnt.add_user", msg: "Add user" })}
		>
			<Card className="w-full shadow-4 border-round-2xl">
				<Form method="post" className="flex flex-column gap-4" noValidate>
					<div className="flex flex-column gap-2">
						<label htmlFor="email" className="font-semibold">
							{ctx.t({
								code: "user_login.email_address",
								msg: "Email address",
							})}
							<span style={{ color: "red" }}> *</span>
						</label>
						<InputText
							id="email"
							type="email"
							name="email"
							className={"w-20rem"}
							placeholder={ctx.t({
								code: "common.enter_email",
								msg: "Enter Email",
							})}
							required
							invalid={!!errors?.email}
						/>
						{errors?.email && (
							<small className="p-error">{errors?.email}</small>
						)}
					</div>
					<div className="flex flex-column gap-2">
						<label htmlFor="organization" className="font-semibold">
							{ctx.t({ code: "common.organization", msg: "Organization" })}
						</label>
						<Dropdown value={selectedOrganization}
							name="organization"
							onChange={(e) => setSelectedOrganization(e.value)}
							options={loaderData.organizations}
							optionLabel="name"
							optionValue="id"
							placeholder="Select an organization"
							showClear
							className="w-20rem lg:w-20rem" />
					</div>
					<div className="flex flex-column gap-2">
						<label htmlFor="role" className="font-semibold">
							{ctx.t({ code: "common.role", msg: "Role" })}
							<span style={{ color: "red" }}> *</span>
						</label>
						<Dropdown value={selectedRole}
							name="role"
							onChange={(e) => setSelectedRole(e.value)}
							options={roles}
							optionLabel="label"
							optionValue="id"
							showClear
							placeholder="Select a role"
							className="w-20rem lg:w-20rem"
							invalid={!!errors?.role}
						/>
						{errors?.role && (
							<small className="p-error">{errors?.role}</small>
						)}
					</div>
					<u>
						<LangLink lang={ctx.lang} to="/settings/access-mgmnt/">
							{ctx.t({ code: "common.back", msg: "Back" })}
						</LangLink>
					</u>
					<Button
						type="submit"
						label={ctx.t({
							code: "common.inviteUser",
							msg: "Invite user",
						})}
						icon="pi pi-sign-in"
						loading={isSubmitting}
						disabled={!!isSubmitting}
						className="w-20rem lg:w-20rem"
					/>
				</Form>
			</Card>
			{/* Role Summary */}
			<div className="dts-form__additional-content mg-grid__col--span-2">
				<div className="dts-heading-5">
					{ctx.t(
						{
							code: "settings.access_mgmnt.selected_role",
							msg: "You have selected [{role}]",
						},
						{
							role:
								selectedRole || ctx.t({ code: "common.role", msg: "Role" }),
						},
					)}
				</div>
				{roleObj?.desc && (
					<div>
						{ctx.t(
							{
								code: "user.role.can_do",
								msg: "A {label} is able to:",
							},
							{ label: roleObj.label },
						)}
						<br />
						<i>{roleObj.desc}</i>
					</div>
				)}
			</div>
		</MainContainer >
	);
}
