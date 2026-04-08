import { ListHazardousEventsUseCase } from "~/modules/hazardous-event/application/use-cases/list-hazardous-events";
import { HazardousEventListLoaderRepository } from "~/modules/hazardous-event/infrastructure/repositories/hazardous-event-list-loader-repository.server";
import { SessionInstanceSettingsRepository } from "~/modules/hazardous-event/infrastructure/repositories/session-instance-settings-repository.server";

function buildHazardousEventListRepository() {
	return new HazardousEventListLoaderRepository();
}

function buildInstanceSettingsRepository() {
	return new SessionInstanceSettingsRepository();
}

export function makeListHazardousEventsUseCase(): ListHazardousEventsUseCase {
	return new ListHazardousEventsUseCase(
		buildHazardousEventListRepository(),
		buildInstanceSettingsRepository(),
	);
}
