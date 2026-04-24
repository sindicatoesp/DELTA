import { useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { PERMISSIONS } from "~/frontend/user/roles";
import { authActionWithPerm, requirePermission } from "~/utils/auth";
import {
	getCountryAccountsIdFromSession,
	redirectWithMessage,
} from "~/utils/session";
import {
	makeSaveAssetUseCase,
} from "~/modules/assets/assets-module.server";
import { contentPickerConfigSector } from "~/modules/assets/presentation/sector-picker-config";
import { dr } from "~/db.server";
import { ASSETS_ROUTE } from "~/modules/assets/presentation/asset-form";
import NewAssetDialog from "~/modules/assets/presentation/new-asset-dialog";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requirePermission(request, PERMISSIONS.ASSETS_CREATE);

	const url = new URL(request.url);
	const sectorId = (url.searchParams.get("sectorId") || "").trim();
	const selectedDisplay = sectorId
		? await contentPickerConfigSector().selectedDisplay(dr, sectorId)
		: {};

	return { selectedDisplay, initialSectorIds: sectorId };
};

export const action = authActionWithPerm(
	PERMISSIONS.ASSETS_CREATE,
	async (actionArgs: ActionFunctionArgs) => {
		try {
			const { request } = actionArgs;
			const countryAccountsId = await getCountryAccountsIdFromSession(request);
			if (!countryAccountsId) {
				throw new Response("Unauthorized", { status: 401 });
			}

			const formData = await request.formData();
			const sectorIds =
				formData
					.getAll("sectorIds")
					.map((value) => String(value || "").trim())
					.filter(Boolean)
					.at(-1) || "";
			const result = await makeSaveAssetUseCase().execute({
				id: null,
				countryAccountsId,
				name: String(formData.get("name") || "").trim(),
				category: String(formData.get("category") || "").trim(),
				notes: String(formData.get("notes") || "").trim(),
				sectorIds,
				nationalId: String(formData.get("nationalId") || "").trim() || null,
			});

			if (!result.ok) {
				return result;
			}

			return redirectWithMessage(actionArgs, `${ASSETS_ROUTE}/${result.id}`, {
				type: "success",
				text: "Asset created",
			});
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "Unable to create asset",
			};
		}
	},
);

export default function Screen() {
	const ld = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<NewAssetDialog
			isSubmitting={isSubmitting}
			onHide={() => navigate(ASSETS_ROUTE)}
			actionData={actionData}
			initialSectorIds={ld.initialSectorIds}
			initialSectorDisplay={ld.selectedDisplay}
		/>
	);
}
