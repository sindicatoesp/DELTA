import { BackendContext } from "~/backend.server/context";
import { approvalStatusIds } from "~/frontend/approval";
import { entityType } from "~/backend.server/models/entity_validation_assignment";
import { saveValidationWorkflowRejectionCommentService } from "~/services/validationWorkflowRejectionService";
import { emailValidationWorkflowStatusChangeNotificationService } from "~/backend.server/services/emailValidationWorkflowService";

interface UpdateStatusParams {
	ctx: BackendContext;
	id: string;
	approvalStatus: approvalStatusIds;
	countryAccountsId: string;
	userId: string;
}

interface UpdateStatusResult {
	ok: boolean;
	message: string;
}

interface ProcessApprovalStatusActionParams {
	ctx: BackendContext;
	request: Request;
	formData: FormData;
	countryAccountsId: string;
	userId: string;
	recordType: entityType;
	updateStatusService: (params: UpdateStatusParams) => Promise<UpdateStatusResult>;
}

export async function processApprovalStatusActionService({
	ctx,
	request,
	formData,
	countryAccountsId,
	userId,
	recordType,
	updateStatusService,
}: ProcessApprovalStatusActionParams): Promise<UpdateStatusResult> {
	const rejectionComments = formData.get("rejection-comments");
	const actionType = String(formData.get("action") || "");
	const id = String(formData.get("id") || "");

	if (!id || request.url.indexOf(id) === -1) {
		return {
			ok: false,
			message: ctx.t({
				code: "common.invalid_id_provided",
				msg: "Invalid ID provided.",
			}),
		};
	}

	const actionStatusMap: Record<string, string> = {
		"submit-validate": "validated",
		"submit-publish": "published",
		"submit-reject": "needs-revision",
	};

	const newStatus = actionStatusMap[actionType] as approvalStatusIds;
	if (!newStatus) {
		return {
			ok: false,
			message: ctx.t({
				code: "common.invalid_action_provided",
				msg: "Invalid action provided.",
			}),
		};
	}

	let result = await updateStatusService({
		ctx,
		id,
		approvalStatus: newStatus,
		countryAccountsId,
		userId,
	});

	if (result.ok && newStatus === "needs-revision") {
		result = await saveValidationWorkflowRejectionCommentService({
			ctx,
			approvalStatus: newStatus,
			recordId: id,
			recordType,
			rejectedByUserId: userId,
			rejectionMessage: rejectionComments ? String(rejectionComments) : "",
		});
	}

	if (result.ok) {
		try {
			await emailValidationWorkflowStatusChangeNotificationService({
				ctx,
				recordId: id,
				recordType,
				newStatus,
				rejectionComments: rejectionComments
					? String(rejectionComments)
					: undefined,
			});
		} catch (err) {
			console.error("Failed to send status change email notifications:", err);
		}
	}

	return result;
}
