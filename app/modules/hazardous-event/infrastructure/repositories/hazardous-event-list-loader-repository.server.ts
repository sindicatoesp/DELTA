import type { LoaderFunctionArgs } from "react-router";
import { hazardousEventsLoader } from "~/backend.server/handlers/events/hazardevent";
import type {
	HazardousEventListRepositoryPort,
	HazardousEventsListResult,
} from "~/modules/hazardous-event/domain/repositories/hazardous-event-list-repository";

export class HazardousEventListLoaderRepository implements HazardousEventListRepositoryPort {
	list(args: LoaderFunctionArgs): Promise<HazardousEventsListResult> {
		return hazardousEventsLoader(args);
	}
}
