import { useLoaderData } from "react-router";

import { makeGetHazardousEventByIdUseCase } from "~/modules/hazardous-event/hazardous-event-module.server";
import HazardousEventDetailsPage from "~/modules/hazardous-event/presentation/hazardous-event-details-page";
import { authLoaderPublicOrWithPerm } from "~/utils/auth";
import { getCountryAccountsIdFromSession } from "~/utils/session";

export const loader = authLoaderPublicOrWithPerm("ViewData", async ({ request, params }) => {
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	if (!countryAccountsId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	if (!params.id) {
		throw new Response("ID is required", { status: 400 });
	}

	const item = await makeGetHazardousEventByIdUseCase().execute({
		id: params.id,
		countryAccountsId,
	});
	if (!item) {
		throw new Response("Hazardous event not found", { status: 404 });
	}

	return { item };
});

export default function HazardousEventViewRoute() {
	const { item } = useLoaderData<typeof loader>();

	return <HazardousEventDetailsPage item={item} />;
}
