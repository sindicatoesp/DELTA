import { useLoaderData } from "react-router";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";


import { formSave } from "~/backend.server/handlers/form/form";
import {
	hazardousEventById,
	hazardousEventCreate,
} from "~/backend.server/models/event";
import { dataForHazardPicker } from "~/backend.server/models/hip_hazard_picker";
import { buildTree } from "~/components/TreeView";
import { dr } from "~/db.server";
import { getUserCountryAccountsWithValidatorRole } from "~/db/queries/userCountryAccountsRepository";
import { divisionTable } from "~/drizzle/schema/divisionTable";

import {
	fieldsDef,
	HazardousEventForm,
} from "~/frontend/events/hazardeventform";
import {
	HazardousEventDialogRoute,
	useHazardousEventFormState,
} from "~/modules/hazardous-event/presentation/hazardous-event-route-form";
import {
	authActionGetAuth,
	authActionWithPerm,
	authLoaderGetUserForFrontend,
	authLoaderWithPerm,
} from "~/utils/auth";
import {
	getCountryAccountsIdFromSession,
	getCountrySettingsFromSession,
	type UserSession,
} from "~/utils/session";

function renderValue(value: unknown) {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	return String(value);
}

export const loader = authLoaderWithPerm("EditData", async (loaderArgs) => {
	const { request } = loaderArgs;

	const user = await authLoaderGetUserForFrontend(loaderArgs);

	// Get tenant context - we need to use the full user session from loaderArgs
	const userSession = (loaderArgs as any).userSession as UserSession;
	if (!userSession) {
		throw new Response("Unauthorized", { status: 401 });
	}
	const hip = await dataForHazardPicker();
	const u = new URL(request.url);

	const parentId = u.searchParams.get("parent") || "";
	const countryAccountsId = await getCountryAccountsIdFromSession(request);

	if (parentId) {
		const parent = await hazardousEventById(parentId);
		if (!parent) {
			throw new Response("Parent not found", { status: 404 });
		}
		// Verify parent belongs to the same tenant
		if (parent.countryAccountsId !== countryAccountsId) {
			throw new Response("Unauthorized Access denied", { status: 403 });
		}
		// Get users with validator role
		const usersWithValidatorRole =
			await getUserCountryAccountsWithValidatorRole(countryAccountsId);

		return {
			hip,
			parentId,
			parent,
			treeData: [],
			ctryIso3: [],
			user,
			countryAccountsId,
			usersWithValidatorRole,
		};
	}

	// Load divisions filtered by tenant context
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
		.where(sql`country_accounts_id = ${countryAccountsId}`);

	const treeData = buildTree(rawData, "id", "parentId", "name", "en", [
		"importId",
		"nationalId",
		"level",
		"name",
	]);

	// Use tenant's ISO3
	const settings = await getCountrySettingsFromSession(request);
	const ctryIso3 = settings.crtyIso3;

	// Load top-level divisions with geojson, filtered by tenant context
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

	// Get users with validator role
	const usersWithValidatorRole =
		await getUserCountryAccountsWithValidatorRole(countryAccountsId);

	return {
		hip,
		treeData,
		ctryIso3,
		divisionGeoJSON: divisionGeoJSON || [],
		user,
		countryAccountsId,
		usersWithValidatorRole: usersWithValidatorRole,
	};
});

export const action = authActionWithPerm("EditData", async (actionArgs) => {
	const { request } = actionArgs;

	const userSession = authActionGetAuth(actionArgs);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);

	return formSave({
		isCreate: true,
		actionArgs,
		fieldsDef: fieldsDef(),
		save: async (tx, id, data) => {
			if (!id) {
				const eventData = {
					...data,
					countryAccountsId: countryAccountsId,
					createdByUserId: userSession.user.id,
					updatedByUserId: userSession.user.id,
				};
				return hazardousEventCreate(tx, eventData);
			} else {
				throw new Error("Not an update screen");
			}
		},
		redirectTo: (id: string) => `/hazardous-event/${id}`,
	});
});

export default function Screen() {
	let ld = useLoaderData<typeof loader>();
	const { fields, errors } = useHazardousEventFormState({
		parent: ld.parentId,
	});

	return (
		<HazardousEventDialogRoute header={"Add new hazardous event"}>
			<div className="space-y-4 p-2 md:p-3">
				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
								Creating
							</p>
							<h2 className="text-xl font-semibold text-gray-900">New Hazardous Event</h2>
							<p className="mt-3 text-sm leading-6 text-gray-600">
								Fill in the details below, then save as draft or submit for validation.
							</p>
						</div>
						<div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
							<div className="grid gap-1 text-sm text-gray-700">
								<p>
									<span className="font-semibold">Initial status:</span> Draft
								</p>
								<p>
									<span className="font-semibold">Parent:</span>{" "}
									{renderValue((ld.parent as any)?.id ? (ld.parent as any).id.slice(0, 8) : "None")}
								</p>
								<p>
									<span className="font-semibold">Validators:</span>{" "}
									{Array.isArray(ld.usersWithValidatorRole)
										? ld.usersWithValidatorRole.length
										: 0}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-3 md:p-4">
					<HazardousEventForm
						edit={false}
						id={undefined}
						hideInnerHeader
						fields={fields}
						errors={errors}
						hip={ld.hip}
						parent={ld.parent as any}
						treeData={ld.treeData}
						ctryIso3={ld.ctryIso3}
						user={ld.user}
						divisionGeoJSON={ld.divisionGeoJSON as any}
						usersWithValidatorRole={ld.usersWithValidatorRole}
					/>
				</section>
			</div>
		</HazardousEventDialogRoute>
	);
}
