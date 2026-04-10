import { dr } from "~/db.server";

import { sql, desc, eq } from "drizzle-orm";

import { authLoaderApi } from "~/utils/auth";

import { createApiListLoader } from "~/backend.server/handlers/view";

import { hipHazardTable } from "~/drizzle/schema/hipHazardTable";
import { hipClusterTable } from "~/drizzle/schema/hipClusterTable";
import { hipTypeTable } from "~/drizzle/schema/hipTypeTable";
import { disasterEventTable } from "~/drizzle/schema/disasterEventTable";
import { apiAuth } from "~/backend.server/models/api_key";

export const loader = authLoaderApi(async (args) => {
	const { request } = args;
	const apiKey = await apiAuth(request);
	const countryAccountsId = apiKey.countryAccountsId;
	if (!countryAccountsId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return createApiListLoader(
		async () => {
			return dr.$count(
				disasterEventTable,
				eq(disasterEventTable.countryAccountsId, countryAccountsId),
			);
		},
		async (offsetLimit) => {
			return dr.query.disasterEventTable.findMany({
				...offsetLimit,
				where: eq(disasterEventTable.countryAccountsId, countryAccountsId),
				orderBy: [desc(disasterEventTable.startDate)],
				with: {
					hipHazard: {
						columns: {
							id: true,
							code: true,
						},
						extras: {
							name: sql<string>`${hipHazardTable.name_en}`.as("name"),
						},
					},
					hipCluster: {
						columns: {
							id: true,
						},
						extras: {
							name: sql<string>`${hipClusterTable.name_en}`.as("name"),
						},
					},
					hipType: {
						columns: {
							id: true,
						},
						extras: {
							name: sql<string>`${hipTypeTable.name_en}`.as("name"),
						},
					},
				},
			});
		},
	)(args);
});
