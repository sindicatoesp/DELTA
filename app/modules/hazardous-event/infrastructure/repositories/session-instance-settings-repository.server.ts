import { getCountrySettingsFromSession } from "~/utils/session";
import type { InstanceSettingsRepositoryPort } from "~/modules/hazardous-event/domain/repositories/instance-settings-repository";

export class SessionInstanceSettingsRepository implements InstanceSettingsRepositoryPort {
	async getWebsiteName(request: Request): Promise<string | undefined> {
		const settings = await getCountrySettingsFromSession(request);
		return settings?.websiteName;
	}
}
