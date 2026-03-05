import { eq } from "drizzle-orm";
import { dr } from "~/db.server";
import { organizationTable } from "~/drizzle/schema";
import { isValidUUID } from "~/utils/id";

export async function getAllOrganizationsByCountryAccountsId(
	countryAccountsId: string,
) {
	if (!isValidUUID(countryAccountsId)) {
		throw new Error(`Invalid UUID: ${countryAccountsId}`);
	}
	const result = await dr
		.select()
		.from(organizationTable)
		.where(eq(organizationTable.countryAccountsId, countryAccountsId))
		.execute();
	return result;
}
