import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import {
	makeCompleteInviteSignupUseCase,
	makeValidateInviteUseCase,
} from "~/modules/account-security/account-security-module.server";
import { AcceptInvitePage } from "~/modules/account-security/presentation/accept-invite-page";
import { htmlTitle } from "~/utils/htmlmeta";
import { redirectWithMessage } from "~/utils/session";

export const meta: MetaFunction = () => {

	return [
		{
			title: htmlTitle(
				"Create your account",
			),
		},
		{
			name: "description",
			content: "Create your account page.",
		},
	];
};

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
	const { request } = loaderArgs;
	const url = new URL(request.url);
	const inviteCode = url.searchParams.get("inviteCode") || "";
	const state = url.searchParams.get("state") || "";
	const queryStringCode = url.searchParams.get("code") || "";
	const res = await makeValidateInviteUseCase().execute(inviteCode);

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

export const action = async (actionArgs: ActionFunctionArgs) => {
	const formData = await actionArgs.request.formData();

	const firstName = String(formData.get("firstName") || "").trim();
	const lastName = String(formData.get("lastName") || "").trim();
	const password = String(formData.get("password") || "");
	const passwordRepeat = String(formData.get("passwordRepeat") || "");
	const email = String(formData.get("email") || "");

	const result = await makeCompleteInviteSignupUseCase().execute({
		firstName,
		lastName,
		email,
		password,
		passwordRepeat,
	});

	if (!result.ok) {
		return { ok: false, errors: result.errors };
	}

	//Redirect 
	return redirectWithMessage(actionArgs, "/user/login", {
		type: "info",
		text: "Your account has been set up successfully. You can sign in now"
		,
	});
};

export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	return (
		<AcceptInvitePage
			inviteCode={loaderData.inviteCode}
			email={loaderData.email}
			isValid={loaderData.inviteCodeValidation.ok}
			validationError={
				loaderData.inviteCodeValidation.ok
					? undefined
					: loaderData.inviteCodeValidation.error
			}
			errors={actionData?.errors}
			isSetupComplete={!!actionData?.ok}
		/>
	);
}
