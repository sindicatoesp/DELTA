import { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
	configAuthSupportedAzureSSOB2C,
	configAuthSupportedForm,
} from "~/utils/config";
import { makeValidateInviteUseCase } from "~/modules/account-security/account-security-module.server";
import { InviteWelcomePage } from "~/modules/account-security/presentation/invite-welcome-page";

export const loader = async (loaderArgs: LoaderFunctionArgs) => {
	const { request } = loaderArgs;

	const confAuthSupportedAzureSSOB2C: boolean =
		configAuthSupportedAzureSSOB2C();
	const confAuthSupportedForm: boolean = configAuthSupportedForm();
	const url = new URL(request.url);
	const inviteCode = url.searchParams.get("inviteCode") || "";
	const state = url.searchParams.get("state") || "";
	const queryStringCode = url.searchParams.get("code") || "";
	const res = await makeValidateInviteUseCase().execute(inviteCode);

	return {
		inviteCode: inviteCode,
		inviteCodeValidation: res,
		code: queryStringCode,
		state: state,
		confAuthSupportedAzureSSOB2C: confAuthSupportedAzureSSOB2C,
		confAuthSupportedForm: confAuthSupportedForm,
	};
};

export default function Screen() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<InviteWelcomePage
			inviteCode={loaderData.inviteCode}
			isValid={loaderData.inviteCodeValidation.ok}
			validationError={
				loaderData.inviteCodeValidation.ok
					? undefined
					: loaderData.inviteCodeValidation.error
			}
			confAuthSupportedForm={loaderData.confAuthSupportedForm}
			confAuthSupportedAzureSSOB2C={loaderData.confAuthSupportedAzureSSOB2C}
		/>
	);
}
