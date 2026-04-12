import { useActionData, useLoaderData } from "react-router";
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
import type { AssetFormFields } from "~/modules/assets/domain/entities/asset";
import { contentPickerConfigSector } from "~/modules/assets/presentation/sector-picker-config";
import { dr } from "~/db.server";
import { AssetForm, ASSETS_ROUTE } from "~/modules/assets/presentation/asset-form";
import type { FormResponse } from "~/frontend/form";

const fieldsDef = [
	{ key: "sectorIds" as const, label: "Sector", type: "other" as const },
	{ key: "name" as const, label: "Name", type: "text" as const, required: true },
	{ key: "category" as const, label: "Category", type: "text" as const },
	{ key: "nationalId" as const, label: "National ID", type: "text" as const },
	{ key: "notes" as const, label: "Notes", type: "textarea" as const },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requirePermission(request, PERMISSIONS.ASSETS_CREATE);

	const url = new URL(request.url);
	const sectorId = (url.searchParams.get("sectorId") || "").trim();
	const selectedDisplay = sectorId
		? await contentPickerConfigSector().selectedDisplay(dr, sectorId)
		: {};

	return {
		fieldsDef,
		selectedDisplay,
		fieldsInitial: {
			sectorIds: sectorId,
		},
	};
};

export const action = authActionWithPerm(
	PERMISSIONS.ASSETS_CREATE,
	async (actionArgs: ActionFunctionArgs) => {
		const { request } = actionArgs;
		const countryAccountsId = await getCountryAccountsIdFromSession(request);
		if (!countryAccountsId) {
			throw new Response("Unauthorized", { status: 401 });
		}

		const formData = await request.formData();
		const result = await makeSaveAssetUseCase().execute({
			id: null,
			countryAccountsId,
			name: String(formData.get("name") || "").trim(),
			category: String(formData.get("category") || "").trim(),
			notes: String(formData.get("notes") || "").trim(),
			sectorIds: String(formData.get("sectorIds") || "").trim(),
			nationalId: String(formData.get("nationalId") || "").trim() || null,
		});

		return redirectWithMessage(actionArgs, `${ASSETS_ROUTE}/${result.id}`, {
			type: "success",
			text: "Asset created",
		});
	},
);

export default function Screen() {
	const ld = useLoaderData<typeof loader>();
	const actionData = useActionData() as FormResponse<AssetFormFields> | undefined;

	const fields = actionData?.data ?? ld.fieldsInitial;
	const errors = actionData && !actionData.ok ? actionData.errors : undefined;

	return (
		<AssetForm
			edit={false}
			id={undefined}
			fields={fields}
			errors={errors}
			fieldDef={ld.fieldsDef}
			selectedDisplay={ld.selectedDisplay}
		/>
	);
}
