import { Form } from "react-router";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface DeleteAssetDialogProps {
    name: string;
    error?: string;
    isSubmitting: boolean;
    onCancel(): void;
}

export default function DeleteAssetDialog(props: DeleteAssetDialogProps) {
    const footer = (
        <div className="mt-4 flex justify-end gap-2">
            <Button
                type="button"
                outlined
                label={"Cancel"}
                icon="pi pi-times"
                onClick={props.onCancel}
                disabled={props.isSubmitting}
            />
            <Button
                type="submit"
                form="delete-asset-form"
                severity="danger"
                label={"Delete"}
                icon="pi pi-trash"
                loading={props.isSubmitting}
                disabled={props.isSubmitting}
            />
        </div>
    );

    return (
        <Dialog
            header={"Delete asset"}
            visible
            modal
            onHide={props.onCancel}
            style={{ width: "520px" }}
            closable={!props.isSubmitting}
            footer={footer}
        >
            <Form method="post" id="delete-asset-form" className="flex flex-col gap-3">
                <p>{"Please confirm deletion."}</p>
                {props.name ? <p className="font-semibold">{props.name}</p> : null}
                <p>{"This action cannot be undone."}</p>
                {props.error ? <small className="text-red-700">{props.error}</small> : null}
            </Form>
        </Dialog>
    );
}
