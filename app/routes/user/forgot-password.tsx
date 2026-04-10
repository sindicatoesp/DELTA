import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
	redirect,
} from "react-router";
import { useLoaderData, useActionData } from "react-router";
import { configAuthSupportedForm } from "~/utils/config";
import { Errors as FormErrors } from "~/frontend/form";
import { formStringData } from "~/utils/httputil";
import { sessionCookie } from "~/utils/session";
import { createCSRFToken } from "~/utils/csrf";
import { makeRequestPasswordResetUseCase } from "~/modules/account-security/account-security-module.server";
import { ForgotPasswordPage } from "~/modules/account-security/presentation/forgot-password-page";
import { htmlTitle } from "~/utils/htmlmeta";

interface FormFields {
	email: string;
}

type LoaderData = {
	csrfToken: string;
};

type ActionData = {
	data?: FormFields;
	errors?: FormErrors<FormFields>;
	success?: string;
};
// Add loader to check if form auth is supported
export const loader = async (
	loaderArgs: LoaderFunctionArgs,
): Promise<Response> => {
	const { request } = loaderArgs;

	// If form authentication is not supported, redirect to login
	if (!configAuthSupportedForm()) {
		return redirect("/user/login");
	}

	const csrfToken = createCSRFToken();

	// Set the CSRF token in the session variable
	const cookieHeader = request.headers.get("Cookie") || "";
	const session = await sessionCookie().getSession(cookieHeader);
	session.set("csrfToken", csrfToken);
	const setCookie = await sessionCookie().commitSession(session);

	return Response.json(
		{
			csrfToken: csrfToken,
		} as LoaderData,
		{ headers: { "Set-Cookie": setCookie } },
	);
};

export const action = async (actionArgs: ActionFunctionArgs) => {
	const { request } = actionArgs;

	if (!configAuthSupportedForm()) {
		return redirect("/user/login");
	}

	const formData = formStringData(await request.formData());
	let data: FormFields = {
		email: formData.email || "",
	};

	const cookieHeader = request.headers.get("Cookie") || "";
	const sessionCurrent = await sessionCookie().getSession(cookieHeader);

	if (formData.csrfToken !== sessionCurrent.get("csrfToken")) {
		return Response.json(
			{
				data,
				errors: {
					general: [
						"CSRF validation failed. Please ensure you're submitting the form from a valid session. For your security, please restart your browser and try again.",
					],
				},
			},
			{ status: 400 },
		);
	}

	let errors: FormErrors<FormFields> = {};

	if (!data.email) {
		errors = {
			fields: {
				email: ["Email is required"],
			},
		};
		return { data, errors };
	}

	try {
		await makeRequestPasswordResetUseCase().execute(data.email);
	} catch (_error) {
		return Response.json(
			{
				data,
				errors: {
					general: [
						"Unable to send email due to a system configuration issue. Please contact your system administrator to report this problem.",
					],
				},
			},
			{ status: 500 },
		);
	}

	return Response.json({
		success: "Check your inbox for a password reset link if this email is associated with an account.",
	});
};

export const meta: MetaFunction = () => {


	return [
		{
			title: htmlTitle(
				"Forgot Password",
			),
		},
		{
			name: "description",
			content: "Forgot Password",
		},
	];
};

export default function Screen() {
	const loaderData = useLoaderData<LoaderData>();
	const actionData = useActionData() as ActionData | undefined;

	return (
		<ForgotPasswordPage
			csrfToken={loaderData.csrfToken}
			errors={actionData?.errors}
			successMessage={actionData?.success}
		/>
	);
}
