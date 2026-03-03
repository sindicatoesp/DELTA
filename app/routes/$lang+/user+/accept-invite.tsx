import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
	useNavigation,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { Form } from "react-router";
import { validateInviteCode } from "~/backend.server/models/user/invite";

import { ViewContext } from "~/frontend/context";

import { htmlTitle } from "~/utils/htmlmeta";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { LangLink } from "~/utils/link";
import { getUserByEmail, updateUserById } from "~/db/queries/user";
import { passwordHash } from "~/utils/passwordUtil";
import { BackendContext } from "~/backend.server/context";
import { sendWelcomeRegistrationEmail } from "~/utils/emailUtil";
import { ErrorState } from "~/components/ErrorState";
import { redirectWithMessage } from "~/utils/session";

export const meta: MetaFunction = () => {
	const ctx = new ViewContext();

	return [
		{
			title: htmlTitle(
				ctx,
				ctx.t({
					code: "meta.create_your_account",
					msg: "Create your account",
				}),
			),
		},
		{
			name: "description",
			content: ctx.t({
				code: "meta.create_your_account_page",
				msg: "Create your account page.",
			}),
		},
	];
};

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
	const { request } = loaderArgs;
	const url = new URL(request.url);
	const inviteCode = url.searchParams.get("inviteCode") || "";
	const state = url.searchParams.get("state") || "";
	const queryStringCode = url.searchParams.get("code") || "";
	const res = await validateInviteCode(inviteCode);

	var email = "";
	if (res.ok == true) {
		email = res.email;
	}

	return {
		inviteCode: inviteCode,
		inviteCodeValidation: res,
		code: queryStringCode,
		state: state,
		email: email,
	};
};

type FieldErrors = {
	firstName?: string;
	lastName?: string;
	password?: string;
	passwordRepeat?: string;
	email?: string;
	form?: string;
};

export const action = async (actionArgs: ActionFunctionArgs) => {
	const formData = await actionArgs.request.formData();

	const firstName = String(formData.get("firstName") || "").trim();
	const lastName = String(formData.get("lastName") || "").trim();
	const password = String(formData.get("password") || "");
	const passwordRepeat = String(formData.get("passwordRepeat") || "");
	const email = String(formData.get("email") || "");

	const errors: FieldErrors = {};

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	// Email
	if (!email) {
		errors.email = "Email is required.";
	} else if (!emailRegex.test(email)) {
		errors.email = "Invalid email address.";
	}

	// First name
	if (!firstName) {
		errors.firstName = "First name is required.";
	} else if (firstName.length < 3) {
		errors.firstName = "First name must be at least 3 characters.";
	}

	// Last name
	if (!lastName) {
		errors.lastName = "Last name is required.";
	} else if (lastName.length < 3) {
		errors.lastName = "Last name must be at least 3 characters.";
	}

	// Password checks
	if (password.length < 12) {
		errors.password = "Password must be at least 12 characters.";
	}

	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);
	const hasSpecial = /[^A-Za-z0-9]/.test(password);

	const conditionsCount =
		Number(hasUpper) +
		Number(hasLower) +
		Number(hasNumber) +
		Number(hasSpecial);

	if (conditionsCount < 2) {
		errors.password =
			"Password must include at least two of the following: uppercase, lowercase, number, special character.";
	}

	if (password === email) {
		errors.password = "Password cannot be the same as the username.";
	}

	if (password !== passwordRepeat) {
		errors.passwordRepeat = "Passwords do not match.";
	}

	const user = await getUserByEmail(email);
	if (!user) {
		errors.email = "No user exist with this email";
	}

	if (Object.keys(errors).length > 0) {
		return { ok: false, errors };
	}

	//Update user data in the table
	if (user) {
		await updateUserById(user.id, {
			inviteCode: "",
			password: passwordHash(password),
			firstName: firstName,
			lastName: lastName,
			emailVerified: true,
		});

		//send welcome email to the user.
		const ctx = new BackendContext(actionArgs);
		sendWelcomeRegistrationEmail(ctx, email, firstName, lastName);
	}

	//Redirect 
	const ctx = new BackendContext(actionArgs);
	return redirectWithMessage(actionArgs, "/user/login", {
		type: "info",
		text: ctx.t({
			code: "your_account_has_been_set_up_successfully.",
			msg: "Your account has been set up successfully. You can sign in now",
		})
		,
	});
};

export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();
	const ctx = new ViewContext();
	const inviteCode = loaderData.inviteCode;
	const email = loaderData.email;
	const actionData = useActionData<typeof action>();
	const errors = actionData?.errors ?? {};

	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	if (!loaderData.inviteCodeValidation.ok) {
		return (
			<>
				<ErrorState
					ctx={ctx}
					title="Invalid Invitation"
					message={loaderData.inviteCodeValidation.error}
				/>
			</>
		);
	}
	return (
		<>
			<div className="flex justify-content-center surface-ground min-h-screen">
				<Card className="w-full md:w-6 lg:w-4 shadow-4 border-round-xl my-6">
					<div className="text-center mb-4">
						<h2 className="m-2">
							{ctx.t({
								code: "users.create_your_account_heading",
								msg: "Create your account",
							})}
						</h2>
						<p className="m-2">
							{ctx.t({
								code: "users.create_account_fill_details",
								msg: "Create your account by filling in the required details.",
							})}
						</p>
						<Message
							className="mb-2"
							severity="warn"
							text={`* ${ctx.t({
								code: "common.required_information",
								desc: "Indicates required information on login form",
								msg: "Required information",
							})}`}
						/>
					</div>

					<Form method="post" id="reset-password-form" noValidate>
						<div className="flex flex-column gap-4">
							<input
								name="inviteCode"
								type="hidden"
								defaultValue={inviteCode}
							></input>
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
									className={classNames("w-full")}
									placeholder={ctx.t({
										code: "user_login.enter_your_email",
										msg: "Enter your email",
										desc: "Placeholder for email input text on login form",
									})}
									readOnly
									required
									defaultValue={email}
								/>
							</div>
							<div className="flex flex-column gap-2">
								<label htmlFor="firstName" className="font-semibold">
									{ctx.t({
										code: "users.first_name_placeholder",
										msg: "First name",
									})}
									<span style={{ color: "red" }}> *</span>
								</label>
								<InputText
									id="firstName"
									type="text"
									name="firstName"
									className={classNames("w-full")}
									placeholder={ctx.t({
										code: "users.enter_your_first_name",
										msg: "Enter your first name",
										desc: "place holder for enter your first name",
									})}
									required
									autoFocus
									invalid={!!errors.firstName}
								/>
								{errors.firstName && (
									<small className="p-error">{errors.firstName}</small>
								)}
							</div>
							<div className="flex flex-column gap-2">
								<label htmlFor="lastName" className="font-semibold">
									{ctx.t({
										code: "users.last_name_placeholder",
										msg: "Last name",
										desc: "place holder for enter your last name",
									})}
									<span style={{ color: "red" }}> *</span>
								</label>
								<InputText
									id="lastName"
									type="text"
									name="lastName"
									className={classNames("w-full")}
									placeholder={ctx.t({
										code: "users.enter_your_last_name",
										msg: "Enter your last name",
									})}
									invalid={!!errors.lastName}
									required
								/>
								{errors.lastName && (
									<small className="p-error">{errors.lastName}</small>
								)}
							</div>
							<div className="flex flex-column gap-2">
								<label htmlFor="password" className="font-semibold">
									{ctx.t({
										code: "user_login.password",
									})}
									<span style={{ color: "red" }}> *</span>
								</label>
								<Password
									id="password"
									name="password"
									toggleMask
									pt={{
										iconField: {
											root: { className: "w-full" },
										},
										input: { className: "w-full" },
									}}
									feedback={false}
									placeholder={ctx.t({
										code: "users.enter_password_placeholder",
										msg: "Enter password",
									})}
									minLength={12}
									required
									invalid={!!errors.password}
								/>
								{errors.password && (
									<small className="p-error">{errors.password}</small>
								)}
							</div>
							<div className="flex flex-column gap-2">
								<label htmlFor="passwordRepeat" className="font-semibold">
									{ctx.t({
										code: "users.confirm_password_placeholder",
										msg: "Confirm password",
										desc: "confirm password",
									})}
									<span style={{ color: "red" }}> *</span>
								</label>
								<Password
									id="passwordRepeat"
									name="passwordRepeat"
									toggleMask
									pt={{
										iconField: {
											root: { className: "w-full" },
										},
										input: { className: "w-full" },
									}}
									feedback={false}
									placeholder={ctx.t({
										code: "users.enter_confirm_password",
										msg: "Enter confirm password",
										desc: "Place holder for enter confirm password",
									})}
									minLength={12}
									required
									invalid={!!errors.passwordRepeat}
								/>
								{errors.passwordRepeat && (
									<small className="p-error">{errors.passwordRepeat}</small>
								)}
							</div>
							<div className="flex flex-column gap-2">
								<ul id="passwordDescription">
									<li>
										{ctx.t(
											{
												code: "users.password.min_characters",
												desc: "Minimum character length for password is 12",
												msg: "At least {min} characters long",
											},
											{ min: 12 },
										)}
									</li>
									<li>
										{ctx.t({
											code: "users.password.two_conditions",
											desc: "Password must include two of the specified character types",
											msg: "Must include two of the following:",
										})}

										<ul>
											<li>
												{ctx.t({
													code: "users.password.uppercase",
													msg: "Uppercase letters",
												})}
											</li>
											<li>
												{ctx.t({
													code: "users.password.lowercase",
													msg: "Lowercase letters",
												})}
											</li>
											<li>
												{ctx.t({
													code: "users.password.numbers",
													msg: "Numbers",
												})}
											</li>
											<li>
												{ctx.t({
													code: "users.password.special_characters",
													msg: "Special characters",
												})}
											</li>
										</ul>
									</li>
									<li>
										{ctx.t({
											code: "users.password.not_username",
											msg: "Cannot be the same as the username",
										})}
									</li>
									<li>
										{ctx.t({
											code: "users.password.not_common",
											msg: "Should not be a simple or commonly used password",
										})}
									</li>
								</ul>
							</div>
							<div>
								<Button
									type="submit"
									label={ctx.t({
										code: "users.setup_account",
										msg: "Set up account",
									})}
									icon="pi pi-user-plus"
									loading={isSubmitting}
									className="w-full mt-2"
									disabled={!!actionData?.ok}
								/>
							</div>
							<div>
								<u>
									<LangLink lang={ctx.lang} to="/">
										{ctx.t({
											code: "home",
											msg: "Home",
										})}
									</LangLink>
								</u>
								{actionData?.ok && (
									<>
										<Message
											severity="success"
											className="w-full"
											text={ctx.t({
												code: "your_account_has_been_set_up_successfully.",
												msg: "Your account has been set up successfully. Click sign in below",
											})}
										/>
										<u>
											<LangLink lang={ctx.lang} to="/user/login">
												{ctx.t({
													code: "sign_in",
													msg: "Sign in",
												})}
											</LangLink>
										</u>
									</>
								)}
							</div>
						</div>
					</Form>
				</Card>
			</div>
		</>
	);
}
