export interface InstanceSettingsRepositoryPort {
	getWebsiteName(request: Request): Promise<string | undefined>;
}
