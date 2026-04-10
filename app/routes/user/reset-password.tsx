import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { configAuthSupportedForm } from "~/utils/config";
import { makeResetPasswordUseCase } from "~/modules/account-security/account-security-module.server";
import { formStringData } from "~/utils/httputil";
import { redirectWithMessage } from "~/utils/session";
import { ResetPasswordPage } from "~/modules/account-security/presentation/reset-password-page";

function getData(request: Request) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token") || "";
	const email = url.searchParams.get("email") || "";
	return { token, email };
}

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
	const { request } = loaderArgs;

	// Check if form authentication is supported
	if (!configAuthSupportedForm()) {
		return redirect("/user/login");
	}

	const { token, email } = getData(request);
	if (!token || !email) {
		return {
			error: "Invalid password reset link",
		};
	}
	return {};
};

interface FormData {
	newPassword: string;
	confirmPassword: string;
}

export const action = async (actionArgs: ActionFunctionArgs) => {
	const { request } = actionArgs;


	// Check if form authentication is supported
	if (!configAuthSupportedForm()) {
		return redirect("/user/login");
	}

	const { token, email } = getData(request);
	const formData = formStringData(await request.formData());
	const data: FormData = {
		newPassword: formData.newPassword || "",
		confirmPassword: formData.confirmPassword || "",
	};

	let res = await makeResetPasswordUseCase().execute(
		email,
		token,
		data.newPassword,
		data.confirmPassword,
	);
	if (!res.ok) {
		return { ok: false, data, errors: res.errors };
	}
	return redirectWithMessage(actionArgs, "/user/login", {
		type: "info",
		text: "Password changed successfully!",
	});
};

export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	return (
		<ResetPasswordPage
			loaderError={loaderData?.error}
			errors={actionData?.errors}
		/>
	);
}
