import { CreateHazardousEventUseCase } from "~/modules/hazardous-event/application/use-cases/create-hazardous-event";
import { DeleteHazardousEventUseCase } from "~/modules/hazardous-event/application/use-cases/delete-hazardous-event";
import { GetHazardousEventByIdUseCase } from "~/modules/hazardous-event/application/use-cases/get-hazardous-event-by-id";
import { ListHazardousEventsUseCase } from "~/modules/hazardous-event/application/use-cases/list-hazardous-events";
import { UpdateHazardousEventUseCase } from "~/modules/hazardous-event/application/use-cases/update-hazardous-event";
import type { HazardousEventRepositoryPort } from "~/modules/hazardous-event/domain/repositories/hazardous-event-repository";
import { getHazardousEventDb } from "~/modules/hazardous-event/infrastructure/db/client.server";
import { DrizzleHazardousEventRepository } from "~/modules/hazardous-event/infrastructure/repositories/drizzle-hazardous-event-repository.server";

export function makeHazardousEventRepository(): HazardousEventRepositoryPort {
	return new DrizzleHazardousEventRepository(getHazardousEventDb());
}

export function makeListHazardousEventsUseCase(
	repository: HazardousEventRepositoryPort = makeHazardousEventRepository(),
): ListHazardousEventsUseCase {
	return new ListHazardousEventsUseCase(repository);
}

export function makeGetHazardousEventByIdUseCase(
	repository: HazardousEventRepositoryPort = makeHazardousEventRepository(),
): GetHazardousEventByIdUseCase {
	return new GetHazardousEventByIdUseCase(repository);
}

export function makeCreateHazardousEventUseCase(
	repository: HazardousEventRepositoryPort = makeHazardousEventRepository(),
): CreateHazardousEventUseCase {
	return new CreateHazardousEventUseCase(repository);
}

export function makeUpdateHazardousEventUseCase(
	repository: HazardousEventRepositoryPort = makeHazardousEventRepository(),
): UpdateHazardousEventUseCase {
	return new UpdateHazardousEventUseCase(repository);
}

export function makeDeleteHazardousEventUseCase(
	repository: HazardousEventRepositoryPort = makeHazardousEventRepository(),
): DeleteHazardousEventUseCase {
	return new DeleteHazardousEventUseCase(repository);
}
