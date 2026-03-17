import { dr } from "~/db.server";
import { assetTable } from "~/drizzle/schema/assetTable";
import { countryAccounts } from "~/drizzle/schema/countryAccounts";
import { inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

const TEST_COUNTRY_ID = "3e8cc2da-7ac4-43ff-953c-867976c3f5e0";

export const createdAssetIds: string[] = [];
export const createdCountryAccountIds: string[] = [];

export async function createTestAsset(
	countryAccountId: string,
	overrides: Record<string, any> = {},
) {
	const [asset] = await dr
		.insert(assetTable)
		.values({
			id: randomUUID(),
			sectorIds: "",
			isBuiltIn: false,
			customName: "Test Asset",
			countryAccountsId: countryAccountId,
			...overrides,
		})
		.returning();
	createdAssetIds.push(asset.id);
	return asset;
}

export async function createOtherTenant() {
	const id = randomUUID();
	await dr.insert(countryAccounts).values({
		id,
		shortDescription: "Other Tenant",
		countryId: TEST_COUNTRY_ID,
		status: 1,
		type: "Training",
	});
	createdCountryAccountIds.push(id);
	return id;
}

export async function cleanupTestAssets() {
	if (createdAssetIds.length > 0) {
		try {
			await dr
				.delete(assetTable)
				.where(inArray(assetTable.id, createdAssetIds));
		} catch (e) {}
	}
	if (createdCountryAccountIds.length > 0) {
		try {
			await dr
				.delete(countryAccounts)
				.where(inArray(countryAccounts.id, createdCountryAccountIds));
		} catch (e) {}
	}
	createdAssetIds.length = 0;
	createdCountryAccountIds.length = 0;
}
