import type { LoaderFunctionArgs } from "react-router";
import type { HazardousEventListRepositoryPort } from "~/modules/hazardous-event/domain/repositories/hazardous-event-list-repository";
import type { InstanceSettingsRepositoryPort } from "~/modules/hazardous-event/domain/repositories/instance-settings-repository";

interface ListHazardousEventsInput {
	args: LoaderFunctionArgs;
}

export class ListHazardousEventsUseCase {
	constructor(
		private readonly hazardousEventListRepository: HazardousEventListRepositoryPort,
		private readonly instanceSettingsRepository: InstanceSettingsRepositoryPort,
	) {}

	async execute({ args }: ListHazardousEventsInput) {
		const [eventsData, instanceName] = await Promise.all([
			this.hazardousEventListRepository.list(args),
			this.instanceSettingsRepository.getWebsiteName(args.request),
		]);

		return {
			...eventsData,
			instanceName: instanceName || "DELTA Resilience",
		};
	}
}
