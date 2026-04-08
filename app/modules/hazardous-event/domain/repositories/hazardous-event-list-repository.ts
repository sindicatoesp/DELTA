import type { LoaderFunctionArgs } from "react-router";
import type { hazardousEventsLoader } from "~/backend.server/handlers/events/hazardevent";

export type HazardousEventsListResult = Awaited<
	ReturnType<typeof hazardousEventsLoader>
>;

export interface HazardousEventListRepositoryPort {
	list(args: LoaderFunctionArgs): Promise<HazardousEventsListResult>;
}
