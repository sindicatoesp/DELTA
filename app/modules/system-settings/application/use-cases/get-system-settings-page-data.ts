import type { InstanceSystemSettings } from "~/modules/system-settings/domain/entities/instance-system-settings";
import type { InstanceSystemSettingsRepositoryPort } from "~/modules/system-settings/domain/repositories/instance-system-settings-repository";

interface GetSystemSettingsPageDataInput {
	countryAccountsId: string | null;
}

interface GetSystemSettingsPageDataResult {
	instanceSystemSettings: InstanceSystemSettings | null;
	currencyArray: string[];
	availableLanguages: string[];
	systemLanguage: string | undefined;
}

export class GetSystemSettingsPageDataUseCase {
	constructor(
		private readonly repository: InstanceSystemSettingsRepositoryPort,
	) {}

	async execute(
		input: GetSystemSettingsPageDataInput,
	): Promise<GetSystemSettingsPageDataResult> {
		const instanceSystemSettings = await this.repository.getByCountryAccountId(
			input.countryAccountsId,
		);

		return {
			instanceSystemSettings,
			currencyArray: instanceSystemSettings
				? [instanceSystemSettings.currencyCode]
				: [],
			availableLanguages: ["en"],
			systemLanguage: instanceSystemSettings?.language,
		};
	}
}
