import { sql } from "drizzle-orm";

import { dr } from "~/db.server";
import { hipHazardTable } from "~/drizzle/schema/hipHazardTable";

/**
 * Fetch specific hazards from the database based on clusterId and searchQuery.
 */
export async function fetchSpecificHazards(
	clusterId?: number,
	searchQuery: string = "",
) {
	// Load all hazards
	const rows = await dr
		.select({
			id: hipHazardTable.id,
			name: hipHazardTable.name_en,
			clusterId: hipHazardTable.clusterId,
		})
		.from(hipHazardTable);

	const query = searchQuery.trim().toLowerCase();

	// Second: filter based on clusterId and search query
	return rows.filter((row) => {
		// Cluster filter
		if (clusterId !== undefined && clusterId !== null) {
			if (row.clusterId !== String(clusterId)) {
				return false;
			}
		}

		// No search → include
		if (!query) {
			return true;
		}

		// Search: match ID or translated name
		return (
			String(row.id).includes(query) || row.name.toLowerCase().includes(query)
		);
	});
}

export interface SpecificHazard {
	id: string;
	name: string;
	clusterId: string;
}

export async function fetchAllSpecificHazards(): Promise<SpecificHazard[]> {
	const rows = await dr
		.select({
			id: hipHazardTable.id,
			name: hipHazardTable.name_en,
			clusterId: hipHazardTable.clusterId,
		})
		.from(hipHazardTable)
		.orderBy(sql`name`);

	return rows;
}
