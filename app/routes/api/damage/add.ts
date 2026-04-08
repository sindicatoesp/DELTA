import { authLoaderApi } from "~/utils/auth";

import { fieldsDefApi } from "~/backend.server/models/damages";

import { jsonCreate } from "~/backend.server/handlers/form/form_api";
import { damagesCreate } from "~/backend.server/models/damages";
import { makeInstanceSystemSettingsRepository } from "~/modules/system-settings/system-settings-module.server";
import { apiAuth } from "~/backend.server/models/api_key";
import { ActionFunctionArgs } from "react-router";

export const loader = authLoaderApi(async () => {
	return Response.json("Use POST");
});

export const action = async (args: ActionFunctionArgs) => {
	const { request } = args;
	if (request.method !== "POST") {
		throw new Response("Method Not Allowed: Only POST requests are supported", {
			status: 405,
		});
	}

	const apiKey = await apiAuth(request);
	const countryAccountsId = apiKey.countryAccountsId;
	if (!countryAccountsId) {
		throw new Response("Unauthorized", { status: 401 });
	}

	const data = await args.request.json();
	const instanceSystemSettingsRepository =
		makeInstanceSystemSettingsRepository();
	const settings =
		await instanceSystemSettingsRepository.getByCountryAccountId(
			countryAccountsId,
		);

	let currencies: string[] = [];
	if (settings) {
		currencies = [settings.currencyCode];
	}

	const saveRes = await jsonCreate({
		data,
		fieldsDef: await fieldsDefApi(currencies),
		create: damagesCreate,
		countryAccountsId: countryAccountsId,
		tableName: "damages",
	});

	return Response.json(saveRes);
};
