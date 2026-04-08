import type { SelectCountries } from "~/drizzle/schema/countriesTable";

export type FictitiousCountryListItem = Pick<
	SelectCountries,
	"id" | "name" | "type"
>;

export interface FictitiousCountryRepositoryPort {
	getById(id: string): Promise<SelectCountries | null>;
	getAllOrderByName(): Promise<FictitiousCountryListItem[]>;
	getByName(name: string): Promise<SelectCountries | null>;
	create(data: {
		name: string;
		type: string;
		iso3: null;
		flagUrl: string;
	}): Promise<void>;
	updateById(
		id: string,
		data: { name: string; type: string; iso3: null },
	): Promise<void>;
	deleteById(id: string): Promise<void>;
}
