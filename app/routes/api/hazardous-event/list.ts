import { hazardousEventTable } from "~/drizzle/schema/hazardousEventTable";
import { dr } from "~/db.server";
import { sql, desc, eq } from "drizzle-orm";
import { createApiListLoader } from "~/backend.server/handlers/view";
import { LoaderFunctionArgs } from "react-router";
import { apiAuth } from "~/backend.server/models/api_key";

import { hipHazardTable } from "~/drizzle/schema/hipHazardTable";
import { hipClusterTable } from "~/drizzle/schema/hipClusterTable";
import { hipTypeTable } from "~/drizzle/schema/hipTypeTable";

export const loader = async (args: LoaderFunctionArgs) => {
	const { request } = args;
	const apiKey = await apiAuth(request);
	const countryAccountsId = apiKey.countryAccountsId;
	if (!countryAccountsId) {
		throw new Response("Unauthorized", { status: 401 });
	}

	return createApiListLoader(
		async () => {
			return dr.$count(
				hazardousEventTable,
				eq(hazardousEventTable.countryAccountsId, countryAccountsId),
			);
		},
		async (offsetLimit) => {
			return await dr.query.hazardousEventTable.findMany({
				...offsetLimit,
				where: eq(hazardousEventTable.countryAccountsId, countryAccountsId),
				orderBy: [desc(hazardousEventTable.startDate)],
				with: {
					hipHazard: {
						columns: { id: true, code: true },
						extras: {
							name: sql<string>`dts_jsonb_localized(${hipHazardTable.name}, 'en')`.as(
								"name",
							),
						},
					},
					hipCluster: {
						columns: { id: true },
						extras: {
							name: sql<string>`dts_jsonb_localized(${hipClusterTable.name}, 'en')`.as(
								"name",
							),
						},
					},
					hipType: {
						columns: { id: true },
						extras: {
							name: sql<string>`dts_jsonb_localized(${hipTypeTable.name}, 'en')`.as(
								"name",
							),
						},
					},
					event: {
						columns: {},
						with: {
							ps: true,
							cs: true,
						},
					},
				},
			});
		},
	)(args);
};
