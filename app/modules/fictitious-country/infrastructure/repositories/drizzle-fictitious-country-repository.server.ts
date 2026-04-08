import { and, eq } from "drizzle-orm";
import {
	countriesTable,
	COUNTRY_TYPE,
	type InsertCountries,
	type SelectCountries,
} from "~/drizzle/schema/countriesTable";
import type {
	FictitiousCountryListItem,
	FictitiousCountryRepositoryPort,
} from "~/modules/fictitious-country/domain/repositories/fictitious-country-repository";
import type { FictitiousCountryDb } from "~/modules/fictitious-country/infrastructure/db/client.server";

export class DrizzleFictitiousCountryRepository implements FictitiousCountryRepositoryPort {
	constructor(private readonly db: FictitiousCountryDb) {}

	async getById(id: string): Promise<SelectCountries | null> {
		const [result] = await this.db
			.select()
			.from(countriesTable)
			.where(
				and(
					eq(countriesTable.id, id),
					eq(countriesTable.type, COUNTRY_TYPE.FICTIONAL),
				),
			);
		return result ?? null;
	}

	async getAllOrderByName(): Promise<FictitiousCountryListItem[]> {
		return this.db
			.select({
				id: countriesTable.id,
				name: countriesTable.name,
				type: countriesTable.type,
			})
			.from(countriesTable)
			.where(eq(countriesTable.type, COUNTRY_TYPE.FICTIONAL))
			.orderBy(countriesTable.name);
	}

	async getByName(name: string): Promise<SelectCountries | null> {
		const [result] = await this.db
			.select()
			.from(countriesTable)
			.where(eq(countriesTable.name, name));
		return result ?? null;
	}

	async create(data: Omit<InsertCountries, "id">): Promise<void> {
		await this.db.insert(countriesTable).values(data);
	}

	async updateById(
		id: string,
		data: { name: string; type: string; iso3: null },
	): Promise<void> {
		await this.db
			.update(countriesTable)
			.set(data)
			.where(eq(countriesTable.id, id));
	}

	async deleteById(id: string): Promise<void> {
		await this.db.delete(countriesTable).where(eq(countriesTable.id, id));
	}
}
