import { Form } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

interface EditOrganizationDialogProps {
    name: string;
    nameError: string;
    isSubmitting: boolean;
    onNameChange(name: string): void;
    onCancel(): void;
}

export default function EditOrganizationDialog(props: EditOrganizationDialogProps) {
    return (
        <Dialog
            header={"Edit organization"}
            visible
            modal
            onHide={props.onCancel}
            className="w-[32rem] max-w-full"
        >
            <Form method="post" className="flex flex-col" noValidate>
                <p className="mb-3 text-red-700">* Required information</p>
                <div className="mb-3 flex flex-col gap-2">
                    <label htmlFor="edit-organization-name">
                        <span className="inline-flex gap-1">
                            <span>{"Name"}</span>
                            <span className="text-red-700">*</span>
                        </span>
                    </label>
                    <InputText
                        id="edit-organization-name"
                        name="name"
                        value={props.name}
                        invalid={!!props.nameError}
                        aria-invalid={props.nameError ? true : false}
                        onChange={(e) => {
                            props.onNameChange(e.target.value);
                        }}
                    />
                    {props.nameError ? <small className="text-red-700">{props.nameError}</small> : null}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" outlined label={"Cancel"} onClick={props.onCancel} />
                    <Button
                        type="submit"
                        label={"Save"}
                        icon="pi pi-check"
                        loading={props.isSubmitting}
                        disabled={props.isSubmitting}
                    />
                </div>
            </Form>
        </Dialog>
    );
}
