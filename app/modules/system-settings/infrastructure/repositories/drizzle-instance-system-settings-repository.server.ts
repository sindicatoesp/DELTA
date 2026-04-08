import { eq } from "drizzle-orm";
import { type Tx } from "~/db.server";
import type {
	CreateInstanceSystemSettingsData,
	InstanceSystemSettings,
	UpdateInstanceSystemSettingsData,
} from "~/modules/system-settings/domain/entities/instance-system-settings";
import type { InstanceSystemSettingsRepositoryPort } from "~/modules/system-settings/domain/repositories/instance-system-settings-repository";
import type { Dr } from "~/modules/system-settings/infrastructure/db/client.server";
import { instanceSystemSettingsTable } from "~/modules/system-settings/infrastructure/db/schema";

export class DrizzleInstanceSystemSettingsRepository implements InstanceSystemSettingsRepositoryPort {
	private db: Dr;

	constructor(db: Dr) {
		this.db = db;
	}

	async getByCountryAccountId(
		countryAccountId: string | null,
		tx?: Tx,
	): Promise<InstanceSystemSettings | null> {
		if (!countryAccountId) {
			return null;
		}

		const result = await (tx ?? this.db)
			.select()
			.from(instanceSystemSettingsTable)
			.where(
				eq(instanceSystemSettingsTable.countryAccountsId, countryAccountId),
			);

		return result[0] || null;
	}

	async create(
		data: CreateInstanceSystemSettingsData,
		tx?: Tx,
	): Promise<InstanceSystemSettings> {
		const result = await (tx ?? this.db)
			.insert(instanceSystemSettingsTable)
			.values(data)
			.returning();

		return result[0];
	}

	async update(
		id: string,
		data: UpdateInstanceSystemSettingsData,
		tx?: Tx,
	): Promise<InstanceSystemSettings | null> {
		const result = await (tx ?? this.db)
			.update(instanceSystemSettingsTable)
			.set({
				...data,
			})
			.where(eq(instanceSystemSettingsTable.id, id))
			.returning();

		return result[0] || null;
	}
}
