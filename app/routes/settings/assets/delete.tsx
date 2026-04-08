import { getTableName } from "drizzle-orm";
import { createDeleteActionWithCountryAccounts } from "~/backend.server/handlers/form/form";
import { assetById, assetDeleteById } from "~/backend.server/models/asset";
import { assetTable } from "~/drizzle/schema/assetTable";

import { route } from "~/frontend/asset";
import { PERMISSIONS } from "~/frontend/user/roles";

export const action = createDeleteActionWithCountryAccounts({
	baseRoute: route,
	delete: assetDeleteById,
	tableName: getTableName(assetTable),
	getById: assetById,
	permission: PERMISSIONS.ASSETS_DELETE,
});
