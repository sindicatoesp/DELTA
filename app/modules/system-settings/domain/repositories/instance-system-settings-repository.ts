import type {
	CreateInstanceSystemSettingsData,
	InstanceSystemSettings,
	UpdateInstanceSystemSettingsData,
} from "~/modules/system-settings/domain/entities/instance-system-settings";

export interface InstanceSystemSettingsRepositoryPort {
	getByCountryAccountId(
		countryAccountId: string | null,
	): Promise<InstanceSystemSettings | null>;
	create(
		data: CreateInstanceSystemSettingsData,
	): Promise<InstanceSystemSettings>;
	update(
		id: string,
		data: UpdateInstanceSystemSettingsData,
	): Promise<InstanceSystemSettings | null>;
}
