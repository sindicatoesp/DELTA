import { getTableName } from "drizzle-orm";
import { createDeleteActionWithCountryAccounts } from "~/backend.server/handlers/form/form";
import { requirePermission, requireUser } from "~/utils/auth";

import {
	hazardousEventById,
	hazardousEventDelete,
} from "~/backend.server/models/event";
import { hazardousEventTable } from "~/drizzle/schema/hazardousEventTable";
import { ContentRepeaterUploadFile } from "~/components/ContentRepeater/UploadFile";
import { getCountryAccountsIdFromSession } from "~/utils/session";
import {
	ActionFunction,
	Form,
	LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "react-router";
import { Button } from "primereact/button";
import {
	HazardousEventDialogRoute,
	useHazardousEventDialogCloseTarget,
} from "~/modules/hazardous-event/presentation/hazardous-event-route-form";

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requirePermission(request, "EditData");
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	if (!countryAccountsId) {
		throw new Response("No instance selected", { status: 500 });
	}

	const id = params.id ?? "";
	const item = await hazardousEventById(id);
	if (!item || item.countryAccountsId !== countryAccountsId) {
		throw new Response("Not Found", { status: 404 });
	}

	return {
		item: {
			id: item.id,
			description: item.description || "",
		},
	};
}


export const action: ActionFunction = async (args) => {

	const { request } = args;
	const userSession = await requireUser(args);
	if (!userSession) {
		throw new Response("Unauthorized", { status: 401 });
	}
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	if (!countryAccountsId) {
		throw new Response("No instance selected", { status: 500 });
	}

	return createDeleteActionWithCountryAccounts({
		baseRoute: "/hazardous-event",
		delete: async (id: string) => {
			return hazardousEventDelete(id, countryAccountsId);
		},
		tableName: getTableName(hazardousEventTable),
		getById: hazardousEventById,
		postProcess: async (_id: string, data: any) => {
			if (data.attachments) {
				ContentRepeaterUploadFile.delete(data.attachments);
			}
		},
		countryAccountsId,
	})(args);
};

export default function HazardousEventDeletePage() {
	const { item } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const closeTarget = useHazardousEventDialogCloseTarget();
	const isSubmitting = navigation.state === "submitting";

	return (
		<HazardousEventDialogRoute
			header={"Delete hazardous event"}
			width={"32rem"}
			maxWidth={"95vw"}
		>
			<div className="space-y-4">
				<p>
					Are you sure you want to delete hazardous event <strong>{item.id}</strong>?
				</p>
				{item.description && (
					<p className="text-sm text-gray-600">{item.description}</p>
				)}
				<Form method="post" className="flex justify-end gap-2">
					<Button
						type="button"
						label={"Cancel"}
						text
						onClick={() => navigate(closeTarget)}
					/>
					<Button
						type="submit"
						label={isSubmitting ? "Deleting..." : "Delete"}
						severity="danger"
						disabled={isSubmitting}
					/>
				</Form>
			</div>
		</HazardousEventDialogRoute>
	);
}
