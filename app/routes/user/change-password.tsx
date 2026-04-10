import { useActionData, MetaFunction, redirect } from "react-router";
import { configAuthSupportedForm } from "~/utils/config";
import { Errors as FormErrors } from "~/frontend/form";
import { formStringData } from "~/utils/httputil";
import { authAction, authActionGetAuth } from "~/utils/auth";
import { ChangePasswordFields } from "~/backend.server/models/user/password";
import { redirectWithMessage } from "~/utils/session";
import { LoaderFunctionArgs } from "react-router";
import { makeChangeOwnPasswordUseCase } from "~/modules/account-security/account-security-module.server";
import { ChangePasswordPage } from "~/modules/account-security/presentation/change-password-page";
import { htmlTitle } from "~/utils/htmlmeta";

// Add loader to check if form auth is supported
export const loader = async (_loaderArgs: LoaderFunctionArgs) => {
	// If form authentication is not supported, redirect to login or settings
	if (!configAuthSupportedForm()) {
		return redirect("/user/settings"); // or wherever appropriate
	}
	return {};
};

export const action = authAction(
	async (actionArgs): Promise<ActionResponse> => {
		// Check if form authentication is supported
		if (!configAuthSupportedForm()) {
			throw redirect("/user/settings/system");
		}

		const { request } = actionArgs;
		const { user } = authActionGetAuth(actionArgs);
		const formData = formStringData(await request.formData());


		const data: ChangePasswordFields = {
			currentPassword: formData.currentPassword || "",
			newPassword: formData.newPassword || "",
			confirmPassword: formData.confirmPassword || "",
		};

		const res = await makeChangeOwnPasswordUseCase().execute(user.id, data);

		if (!res.ok) {
			return { ok: false, data, errors: res.errors };
		}

		return redirectWithMessage(actionArgs, "/disaster-event", {
			type: "info",
			text: "Password changed.",
		});
	},
);

export const meta: MetaFunction = () => {


	return [
		{
			title: htmlTitle(
				"Change Password",
			),
		},
		{
			name: "description",
			content: "Changing password",
		},
	];
};

interface ActionResponse {
	ok: boolean;
	data?: ChangePasswordFields;
	errors?: FormErrors<ChangePasswordFields>;
}

function changePasswordFieldsCreateEmpty(): ChangePasswordFields {
	return {
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	};
}

export default function Screen() {
	const actionData = useActionData<typeof action>();
	const data = actionData?.data || changePasswordFieldsCreateEmpty();

	return (
		<ChangePasswordPage data={data} errors={actionData?.errors} />
	);
}
