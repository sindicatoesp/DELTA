import { getTableName } from "drizzle-orm";
import { LoaderFunctionArgs, Link, useLoaderData } from "react-router";

import {
	createViewLoaderPublicApproved,
	createViewLoaderPublicApprovedWithAuditLog,
} from "~/backend.server/handlers/form/form";

import { hazardousEventById } from "~/backend.server/models/event";
import { hazardousEventTable } from "~/drizzle/schema/hazardousEventTable";
import { optionalUser } from "~/utils/auth";
import { getCountryAccountsIdFromSession } from "~/utils/session";
import { HazardousEventDialogRoute } from "~/modules/hazardous-event/presentation/hazardous-event-route-form";
import { approvalStatusKeyToLabel, type approvalStatusIds } from "~/frontend/approval";
import { formatDateDisplay } from "~/utils/date";
import AuditLogHistory from "~/components/AuditLogHistory";


import { authActionGetAuth, authActionWithPerm } from "~/utils/auth";
import { updateHazardousEventStatusService } from "~/services/hazardousEventService";
import { emailValidationWorkflowStatusChangeNotificationService } from "~/backend.server/services/emailValidationWorkflowService";
import { saveValidationWorkflowRejectionCommentService } from "~/services/validationWorkflowRejectionService";


interface LoaderData {
	item: any;
	isPublic: boolean;
	auditLogs?: any[];
}

function renderValue(value: unknown) {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	return String(value);
}

function prettyJson(value: unknown) {
	if (value === null || value === undefined) {
		return "-";
	}
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="rounded border border-gray-200 bg-white p-3">
			<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
				{label}
			</p>
			<p className="mt-1 text-sm text-gray-900">{value}</p>
		</div>
	);
}

export const loader = async (
	loaderArgs: LoaderFunctionArgs,
): Promise<LoaderData> => {
	const { request, params } = loaderArgs;

	const { id } = params;

	if (!id) {
		throw new Response("ID is required", { status: 400 });
	}

	const countryAccountsId = await getCountryAccountsIdFromSession(request);

	const userSession = await optionalUser(loaderArgs);
	const loaderFunction = userSession
		? createViewLoaderPublicApprovedWithAuditLog({
			getById: hazardousEventById,
			recordId: id,
			tableName: getTableName(hazardousEventTable),
		})
		: createViewLoaderPublicApproved({
			getById: hazardousEventById,
		});

	const result = await loaderFunction(loaderArgs);
	if (result.item.countryAccountsId !== countryAccountsId) {
		throw new Response("Unauthorized access", { status: 401 });
	}

	return {
		...result,
	};
};

export const action = authActionWithPerm("EditData", async (actionArgs) => {
	const { request } = actionArgs;

	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const userSession = authActionGetAuth(actionArgs);
	const formData = await request.formData();

	const rejectionComments = formData.get("rejection-comments");
	const actionType = String(formData.get("action") || "");
	const id = String(formData.get("id") || "");


	// Basic validation
	if (!id || request.url.indexOf(id) === -1) {
		return Response.json({
			ok: false,
			message: "Invalid ID provided.",
		});
	}

	// Business rules: map action -> status
	const actionStatusMap: Record<string, string> = {
		"submit-validate": "validated",
		"submit-publish": "published",
		"submit-reject": "needs-revision",
	};

	const newStatus = actionStatusMap[actionType] as approvalStatusIds;
	if (!newStatus) {
		return {
			ok: false,
			message: "Invalid action provided.",
		};
	}

	// Delegate to service
	let result = await updateHazardousEventStatusService({
		id: id,
		approvalStatus: newStatus,
		countryAccountsId: countryAccountsId,
		userId: userSession.user.id,
	});

	if (result.ok && newStatus === "needs-revision") {
		// Delegate to service to handle save rejection comments to DB
		result = await saveValidationWorkflowRejectionCommentService({
			approvalStatus: newStatus,
			recordId: id,
			recordType: "hazardous_event",
			rejectedByUserId: userSession?.user.id,
			rejectionMessage: rejectionComments ? String(rejectionComments) : "",
		});
	}

	if (result.ok) {
		// Delegate to service to send email notification
		try {
			await emailValidationWorkflowStatusChangeNotificationService({
				recordId: id,
				recordType: "hazardous_event",
				newStatus,
				rejectionComments: rejectionComments
					? String(rejectionComments)
					: undefined,
			});
		} catch (err) {
			console.error("Failed to send status change email notifications:", err);
		}
	}

	return Response.json(result);
});

export default function Screen() {
	const ld = useLoaderData<typeof loader>();
	const item = ld.item;
	const hazardName =
		item.hipHazard?.name || item.hipCluster?.name || item.hipType?.name || "Unknown";
	const workflowStatusLabel = item.approvalStatus
		? approvalStatusKeyToLabel(item.approvalStatus as approvalStatusIds)
		: "-";
	const eventStatusLabel = item.hazardousEventStatus
		? item.hazardousEventStatus.charAt(0).toUpperCase() + item.hazardousEventStatus.slice(1)
		: "-";
	const attachmentsCount = Array.isArray(item.attachments) ? item.attachments.length : 0;
	const spatialCount = Array.isArray(item.spatialFootprint)
		? item.spatialFootprint.length
		: 0;
	const causedByLabel = item.parent
		? item.parent.hipHazard?.name || item.parent.hipCluster?.name || item.parent.hipType?.name || item.parent.id
		: null;

	return (
		<HazardousEventDialogRoute
			header={"Hazardous event details"}
			width="95vw"
			maxWidth="1200px"
		>
			<div className="space-y-4 p-2 md:p-3">
				<section className="rounded-lg border border-gray-200 bg-white p-4">
					<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
								Viewing
							</p>
							<h2 className="text-xl font-semibold text-gray-900">{hazardName}</h2>
							<p className="mt-1 text-sm text-gray-600">Review the full hazardous event details below.</p>
						</div>
						<div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
							<div className="grid gap-1 text-sm text-gray-700">
								<p>
									<span className="font-semibold">ID:</span> {item.id}
								</p>
								<p className="inline-flex items-center gap-2">
									<span className="font-semibold">Status:</span>
									<span
										className={`dts-status dts-status--${String(item.approvalStatus || "draft")}`}
										aria-hidden="true"
									/>
									<span>{workflowStatusLabel}</span>
								</p>
								<p>
									<span className="font-semibold">Updated:</span> {renderValue(formatDateDisplay(item.updatedAt, "dd MMM yyyy"))}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<DetailRow label="Approval Status" value={workflowStatusLabel} />
					<DetailRow label="Start Date" value={renderValue(formatDateDisplay(item.startDate, "dd MMM yyyy"))} />
					<DetailRow label="End Date" value={renderValue(formatDateDisplay(item.endDate, "dd MMM yyyy"))} />
					<DetailRow label="Event Status" value={eventStatusLabel} />
					<DetailRow label="Hazard" value={renderValue(item.hipHazard?.name)} />
					<DetailRow label="Cluster" value={renderValue(item.hipCluster?.name)} />
					<DetailRow label="Type" value={renderValue(item.hipType?.name)} />
					<DetailRow label="Record Originator" value={renderValue(item.recordOriginator)} />
					<DetailRow label="Data Source" value={renderValue(item.dataSource)} />
					<DetailRow label="Magnitude" value={renderValue(item.magnitude)} />
					<DetailRow label="Country Account ID" value={renderValue(item.countryAccountsId)} />
					<DetailRow label="API Import ID" value={renderValue(item.apiImportId)} />
					<DetailRow label="Created" value={renderValue(formatDateDisplay(item.createdAt, "dd MMM yyyy"))} />
					<DetailRow label="Updated" value={renderValue(formatDateDisplay(item.updatedAt, "dd MMM yyyy"))} />
					<DetailRow label="Attachments" value={`${attachmentsCount} file(s)`} />
					<DetailRow label="Spatial Footprints" value={`${spatialCount} item(s)`} />
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						National Specification
					</h3>
					<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
						{renderValue(item.nationalSpecification)}
					</p>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						Description
					</h3>
					<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
						{renderValue(item.description)}
					</p>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						Composite Event Chains Explanation
					</h3>
					<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
						{renderValue(item.chainsExplanation)}
					</p>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						Event Relationships
					</h3>
					<div className="mt-3 space-y-3 text-sm text-gray-900">
						<div>
							<p className="font-medium text-gray-700">Caused By</p>
							{item.parent ? (
								<Link className="mt-1 inline-block text-blue-700 underline" to={`/hazardous-event/${item.parent.id}`}>
									{causedByLabel}
								</Link>
							) : (
								<p>-</p>
							)}
						</div>
						<div>
							<p className="font-medium text-gray-700">Causing</p>
							{Array.isArray(item.children) && item.children.length > 0 ? (
								<ul className="list-inside list-disc space-y-1">
									{item.children.map((child: any) => (
										<li key={child.id}>
											<Link
												className="text-blue-700 underline"
												to={`/hazardous-event/${child.id}`}
											>
												{child.hipHazard?.name || child.hipCluster?.name || child.hipType?.name || child.id}
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p>-</p>
							)}
						</div>
					</div>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						Attachments
					</h3>
					<pre className="mt-3 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
						{prettyJson(item.attachments)}
					</pre>
				</section>

				<section className="rounded-lg border border-gray-200 bg-white p-5">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
						Spatial Footprints
					</h3>
					<pre className="mt-3 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-900">
						{prettyJson(item.spatialFootprint)}
					</pre>
				</section>

				{Array.isArray(ld.auditLogs) && ld.auditLogs.length > 0 ? (
					<section className="rounded-lg border border-gray-200 bg-white p-4">
						<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
							Audit History
						</h3>
						<AuditLogHistory auditLogs={ld.auditLogs as any} />
					</section>
				) : null}
			</div>
		</HazardousEventDialogRoute>
	);
}
