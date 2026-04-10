import { dr } from "~/db.server";

import { hipClusterTable } from "~/drizzle/schema/hipClusterTable";
import { sql, eq } from "drizzle-orm";

/**
 * Fetch hazard clusters from the database.
 */
export async function fetchHazardClusters(typeId: string | null) {
	const query = dr
		.select({
			id: hipClusterTable.id,
			name: hipClusterTable.name_en,
			typeId: hipClusterTable.typeId,
		})
		.from(hipClusterTable)
		.orderBy(sql`name`);

	if (typeId !== null) {
		query.where(eq(hipClusterTable.typeId, typeId));
	}

	const rows = await query;

	return rows;
}
