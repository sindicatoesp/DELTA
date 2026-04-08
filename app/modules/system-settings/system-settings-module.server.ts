import { GetSystemSettingsPageDataUseCase } from "~/modules/system-settings/application/use-cases/get-system-settings-page-data";
import { UpdateSystemSettingsUseCase } from "~/modules/system-settings/application/use-cases/update-system-settings";
import { getSystemSettingsDb } from "~/modules/system-settings/infrastructure/db/client.server";
import { DrizzleInstanceSystemSettingsRepository } from "~/modules/system-settings/infrastructure/repositories/drizzle-instance-system-settings-repository.server";

function buildInstanceSystemSettingsRepository() {
	return new DrizzleInstanceSystemSettingsRepository(getSystemSettingsDb());
}

export function makeInstanceSystemSettingsRepository(): DrizzleInstanceSystemSettingsRepository {
	return buildInstanceSystemSettingsRepository();
}

export function makeGetSystemSettingsPageDataUseCase(): GetSystemSettingsPageDataUseCase {
	return new GetSystemSettingsPageDataUseCase(
		buildInstanceSystemSettingsRepository(),
	);
}

export function makeUpdateSystemSettingsUseCase(): UpdateSystemSettingsUseCase {
	return new UpdateSystemSettingsUseCase(
		buildInstanceSystemSettingsRepository(),
	);
}
