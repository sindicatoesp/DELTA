import { Form } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

interface ApiKeyDialogUserOption {
    value: string;
    label: string;
}

interface ApiKeyDialogProps {
    mode: "create" | "edit";
    name: string;
    nameError?: string;
    selectedUserId: string;
    selectedUserError?: string;
    userOptions: ApiKeyDialogUserOption[];
    isAdmin: boolean;
    isSubmitting: boolean;
    onNameChange(name: string): void;
    onAssignedUserChange(value: string): void;
    onCancel(): void;
}

export default function ApiKeyDialog(props: ApiKeyDialogProps) {
    const header = props.mode === "create" ? "Add API key" : "Edit API key";

    return (
        <Dialog
            header={header}
            visible
            modal
            onHide={props.onCancel}
            className="w-[36rem] max-w-full"
        >
            <Form method="post" className="flex flex-col gap-4" noValidate>
                <p className="text-red-700">* Required information</p>
                <div className="flex flex-col gap-2">
                    <label htmlFor="api-key-name">
                        <span className="inline-flex gap-1">
                            <span>{"Name"}</span>
                            <span className="text-red-700">*</span>
                        </span>
                    </label>
                    <InputText
                        id="api-key-name"
                        name="name"
                        value={props.name}
                        invalid={!!props.nameError}
                        aria-invalid={props.nameError ? true : false}
                        onChange={(e) => {
                            props.onNameChange(e.target.value);
                        }}
                    />
                    {props.nameError ? (
                        <small className="text-red-700">{props.nameError}</small>
                    ) : null}
                </div>

                {props.isAdmin ? (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="assignedToUserId">{"Assign to user"}</label>
                        {props.userOptions.length > 0 ? (
                            <>
                                <Dropdown
                                    id="assignedToUserId"
                                    name="assignedToUserId"
                                    value={props.selectedUserId}
                                    options={props.userOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select user (optional)"
                                    showClear
                                    className="w-full"
                                    invalid={!!props.selectedUserError}
                                    onChange={(e) => {
                                        props.onAssignedUserChange(e.value || "");
                                    }}
                                />
                                <small className="text-gray-600">
                                    {
                                        "If selected, this API key is only valid while the assigned user remains active."
                                    }
                                </small>
                            </>
                        ) : (
                            <small className="text-gray-600">
                                {
                                    "No users are available for assignment. Add users in Access Management first."
                                }
                            </small>
                        )}
                        {props.selectedUserError ? (
                            <small className="text-red-700">{props.selectedUserError}</small>
                        ) : null}
                    </div>
                ) : null}

                <div className="mt-2 flex justify-end gap-2">
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