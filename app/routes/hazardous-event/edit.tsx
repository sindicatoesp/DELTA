import {
	hazardousEventById,
	hazardousEventUpdate,
} from "~/backend.server/models/event";

import {
	fieldsDef,
	HazardousEventForm,
} from "~/frontend/events/hazardeventform";

import {
	HazardousEventDialogRoute,
	useHazardousEventFormState,
} from "~/modules/hazardous-event/presentation/hazardous-event-route-form";
import { approvalStatusKeyToLabel, type approvalStatusIds } from "~/frontend/approval";
import { formatDateDisplay } from "~/utils/date";

import { formSave } from "~/backend.server/handlers/form/form";

import {
	authActionGetAuth,
	authActionWithPerm,
	authLoaderGetUserForFrontend,
	authLoaderWithPerm,
} from "~/utils/auth";

import { useLoaderData } from "react-router";

import { dataForHazardPicker } from "~/backend.server/models/hip_hazard_picker";

import { getItem2 } from "~/backend.server/handlers/view";

import {
	getCountryAccountsIdFromSession,
	getCountrySettingsFromSession,
} from "~/utils/session";
import { divisionTable } from "~/drizzle/schema/divisionTable";
import { buildTree } from "~/components/TreeView";
import { dr } from "~/db.server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";



import { getUserCountryAccountsWithValidatorRole } from "~/db/queries/userCountryAccountsRepository";

function renderValue(value: unknown) {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	return String(value);
}

export const loader = authLoaderWithPerm("EditData", async (loaderArgs) => {
	const { params, request } = loaderArgs;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const item = await getItem2(params, hazardousEventById);
	if (!item || item.countryAccountsId !== countryAccountsId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	const user = await authLoaderGetUserForFrontend(loaderArgs);

	let hip = await dataForHazardPicker();

	if (item!.parent) {
		let parent = item.parent;
		let parent2 = await hazardousEventById(parent.id);
		if (parent2?.countryAccountsId !== countryAccountsId) {
			throw new Response("Unauthorized", { status: 401 });
		}
		const usersWithValidatorRole =
			await getUserCountryAccountsWithValidatorRole(countryAccountsId);
		return {
			hip,
			item,
			parent: parent2,
			treeData: [],
			user,
			usersWithValidatorRole: usersWithValidatorRole,
		};
	}

	// Define Keys Mapping (Make it Adaptable)
	const idKey = "id";
	const parentKey = "parentId";
	const nameKey = "name";
	const rawData = await dr
		.select({
			id: divisionTable.id,
			parentId: divisionTable.parentId,
			name: divisionTable.name,
			importId: divisionTable.importId,
			nationalId: divisionTable.nationalId,
			level: divisionTable.level,
		})
		.from(divisionTable)
		.where(eq(divisionTable.countryAccountsId, countryAccountsId));
	const treeData = buildTree(rawData, idKey, parentKey, nameKey, "en", [
		"importId",
		"nationalId",
		"level",
		"name",
	]);

	const divisionGeoJSON = await dr
		.select({
			id: divisionTable.id,
			name: divisionTable.name,
			geojson: divisionTable.geojson,
		})
		.from(divisionTable)
		.where(
			and(
				isNull(divisionTable.parentId),
				isNotNull(divisionTable.geojson),
				eq(divisionTable.countryAccountsId, countryAccountsId),
			),
		);

	const settings = await getCountrySettingsFromSession(request);
	const ctryIso3 = settings.ctryIso3;

	// Get users with validator role
	const usersWithValidatorRole =
		await getUserCountryAccountsWithValidatorRole(countryAccountsId);

	return {
		hip: hip,
		item: item,
		treeData: treeData,
		ctryIso3: ctryIso3,
		divisionGeoJSON: divisionGeoJSON || [],
		user,
		countryAccountsId,
		usersWithValidatorRole: usersWithValidatorRole,
	};
});

export const action = authActionWithPerm("EditData", async (actionArgs) => {
	const { request } = actionArgs;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userSession = authActionGetAuth(actionArgs);

	return formSave({
		actionArgs,
		fieldsDef: fieldsDef(),
		save: async (tx, id, data) => {
			const updatedData = {
				...data,
				countryAccountsId,
				updatedByUserId: userSession.user.id,
			};
			if (id) {
				// Save normal for data to database using the hazardousEventUpdate function
				const returnValue = await hazardousEventUpdate(
					tx,
					id,
					updatedData,
				);

				return returnValue;
			} else {
				throw "not an create screen";
			}
		},
		redirectTo: (id: string) => `/hazardous-event/${id}`,
	});
});

export default function Screen() {
	let ld = useLoaderData<typeof loader>();
	if (!ld.item) {
		throw "invalid";
	}

	const hazardName =
		ld.item.hipHazard?.name || ld.item.hipCluster?.name || ld.item.hipType?.name || "Unknown";
	const workflowStatusLabel = ld.item.approvalStatus
		? approvalStatusKeyToLabel(ld.item.approvalStatus as approvalStatusIds)
		: "-";
	const initialFields = {
		// both ld.item.event and ld.item have description fields, description field on event is not used
		// TODO: remove those fields from db
		...ld.item,
		parent: "",
		// normalize nullable properties to undefined to satisfy Partial<HazardousEventFields>
		createdByUserId: undefined,
		updatedByUserId: undefined,
		submittedByUserId: undefined,
		submittedAt: undefined,
		validatedByUserId: undefined,
		validatedAt: undefined,
		publishedByUserId: undefined,
		publishedAt: undefined,
		// Convert date strings to Date objects
		updatedAt: ld.item.updatedAt ? new Date(ld.item.updatedAt) : undefined,
		createdAt: ld.item.createdAt ? new Date(ld.item.createdAt) : undefined,
	};
	const { fields, errors } = useHazardousEventFormState(initialFields);

	return (
		<HazardousEventDialogRoute header={"Edit hazardous event"}>
			<div className="space-y-4 p-2 md:p-3">
				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
								Editing
							</p>
							<h2 className="text-xl font-semibold text-gray-900">{hazardName}</h2>
							<p className="mt-3 text-sm leading-6 text-gray-600">Update fields and save changes to this event record.</p>
						</div>
						<div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
							<div className="grid gap-1 text-sm text-gray-700">
								<p>
									<span className="font-semibold">ID:</span> {ld.item.id}
								</p>
								<p>
									<span className="font-semibold">Status:</span> {workflowStatusLabel}
								</p>
								<p>
									<span className="font-semibold">Created:</span> {renderValue(formatDateDisplay(ld.item.createdAt, "dd MMM yyyy"))}
								</p>
								<p>
									<span className="font-semibold">Updated:</span> {renderValue(formatDateDisplay(ld.item.updatedAt, "dd MMM yyyy"))}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-3 md:p-4">
					<HazardousEventForm
						edit
						id={ld.item.id}
						hideInnerHeader
						fields={fields}
						errors={errors}
						hip={ld.hip}
						parent={ld.parent as any}
						treeData={ld.treeData}
						ctryIso3={ld.ctryIso3 as any}
						user={ld.user}
						divisionGeoJSON={ld.divisionGeoJSON as any}
						usersWithValidatorRole={ld.usersWithValidatorRole ?? []}
					/>
				</section>
			</div>
		</HazardousEventDialogRoute>
	);
}
