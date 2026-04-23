import { aliasedTable, eq, sql } from "drizzle-orm";

import { sectorTable } from "~/drizzle/schema/sectorTable";
import type {
	SectorListItem,
	SectorsPageData,
} from "~/modules/sectors/domain/entities/sector";
import type { SectorRepositoryPort } from "~/modules/sectors/domain/repositories/sector-repository";
import type { Dr } from "~/modules/sectors/infrastructure/db/client.server";

export class DrizzleSectorRepository implements SectorRepositoryPort {
	constructor(private readonly db: Dr) {}

	async getSectorsPageData(): Promise<SectorsPageData> {
		const parent = aliasedTable(sectorTable, "parent");
		const sectors = await this.db
			.select({
				id: sectorTable.id,
				sectorname:
					sql<string>`dts_jsonb_localized(${sectorTable.name}, 'en')`.as(
						"sectorname",
					),
				level: sectorTable.level,
				description:
					sql<string>`dts_jsonb_localized(${sectorTable.description}, 'en')`.as(
						"description",
					),
				parentId: sectorTable.parentId,
				createdAt: sectorTable.createdAt,
				parentName: sql<string>`dts_jsonb_localized(${parent.name}, 'en')`.as(
					"parentName",
				),
			})
			.from(sectorTable)
			.leftJoin(parent, eq(parent.id, sectorTable.parentId))
			.orderBy(sectorTable.id);

		return {
			sectors: sectors as SectorListItem[],
		};
	}
}
