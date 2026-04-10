import { ConfirmDialog } from "primereact/confirmdialog";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { notifyError } from "../utils/notifications";

interface DeleteButtonProps {
	action: string;
	label?: string;
	useIcon?: boolean;
	confirmMessage?: string;
	title?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmButtonFirst?: boolean;
	confirmIcon?: React.ReactNode;
	cancelIcon?: React.ReactNode;
}

/**
 * Generic delete button component that can be customized
 */
export function DeleteButton(props: DeleteButtonProps) {
	let fetcher = useFetcher();
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		let data = fetcher.data as any;
		if (fetcher.state === "idle" && data && !data.ok) {
			console.error(`Delete failed`, data);
			notifyError(data.error || "Delete failed");
		}
	}, [fetcher.state, fetcher.data]);

	function showDialog(e: React.MouseEvent) {
		e.preventDefault();
		setShowConfirm(true);
	}

	function confirmDelete() {
		console.log("Submitting to:", props.action);
		setShowConfirm(false);
		fetcher.submit(null, { method: "post", action: props.action });
	}

	let submitting = fetcher.state !== "idle";

	return (
		<>
			{props.useIcon ? (
				<button
					type="button"
					className="mg-button mg-button-table"
					aria-label={"Delete"}
					disabled={submitting}
					onClick={showDialog}
				>
					{submitting ? (
						<span className="dts-spinner" />
					) : (
						<svg aria-hidden="true" focusable="false" role="img">
							<use href="/assets/icons/trash-alt.svg#delete" />
						</svg>
					)}
				</button>
			) : (
				<button type="button" disabled={submitting} onClick={showDialog}>
					{submitting
						? "Deleting..."
						: props.label || "Delete"}
				</button>
			)}

			<ConfirmDialog
				visible={showConfirm}
				onHide={() => setShowConfirm(false)}
				header={props.title || "Record Deletion"}
				message={props.confirmMessage || "Please confirm deletion."}
				footer={
					props.confirmButtonFirst ?? true ? (
						<>
							<button
								type="button"
								onClick={confirmDelete}
								className="mg-button mg-button-primary"
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								{props.confirmLabel ?? "Yes"}
								{props.confirmIcon && <span>{props.confirmIcon}</span>}
							</button>
							<button
								type="button"
								onClick={() => setShowConfirm(false)}
								className="mg-button mg-button-outline"
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								{props.cancelLabel ?? "No"}
								{props.cancelIcon && <span>{props.cancelIcon}</span>}
							</button>
						</>
					) : (
						<>
							<button
								type="button"
								onClick={() => setShowConfirm(false)}
								className="mg-button mg-button-primary"
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								{props.cancelLabel ?? "No"}
								{props.cancelIcon && <span>{props.cancelIcon}</span>}
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								className="mg-button mg-button-outline"
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								{props.confirmLabel ?? "Yes"}
								{props.confirmIcon && <span>{props.confirmIcon}</span>}
							</button>
						</>
					)
				}
			/>
		</>
	);
}

/**
 * Specialized delete button for hazardous events that meets the specific business requirements:
 * - Title: "Are you sure you want to delete this event?"
 * - Warning text: "This data cannot be recovered after being deleted."
 * - Primary button: "Do not delete"
 * - Secondary button: "Delete permanently" with trash icon
 */
export function HazardousEventDeleteButton({ action, useIcon = true }: {
	action: string;
	useIcon?: boolean;
}) {
	// Create a trash icon for the delete button
	const trashIcon = (
		<svg aria-hidden="true" focusable="false" role="img" width="16" height="16">
			<use href="/assets/icons/trash-alt.svg#delete" />
		</svg>
	);
	return (
		<DeleteButton
			action={action}
			useIcon={useIcon}
			title={"Are you sure you want to delete this record?"}
			confirmMessage={"This data cannot be recovered after being deleted."}
			confirmLabel={"Delete permanently"}
			cancelLabel={"Do not delete"}
			confirmButtonFirst={false} // Put the cancel button first (as primary)
			confirmIcon={trashIcon}
		/>
	);
}

