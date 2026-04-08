import { useEffect, useRef, useState } from "react";
import { Form } from "react-router";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

interface DeleteApiKeyDialogProps {
    name: string;
    error?: string;
    isSubmitting: boolean;
    onCancel(): void;
}

export default function DeleteApiKeyDialog(props: DeleteApiKeyDialogProps) {
    const toast = useRef<Toast>(null);
    const [dialogVisible, setDialogVisible] = useState(true);

    useEffect(() => {
        if (props.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: props.error,
                life: 6000,
            });
        }
    }, [props.error]);

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header={"Delete API key"}
                visible={dialogVisible}
                modal
                onHide={props.onCancel}
                className="w-[30rem] max-w-full"
            >
                <Form method="post" onSubmit={() => setDialogVisible(false)}>
                    <p>{"Please confirm deletion."}</p>
                    {props.name ? <p>{props.name}</p> : null}
                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" outlined label={"Cancel"} onClick={props.onCancel} />
                        <Button
                            type="submit"
                            severity="danger"
                            label={"Delete"}
                            icon="pi pi-trash"
                            loading={props.isSubmitting}
                            disabled={props.isSubmitting}
                        />
                    </div>
                </Form>
            </Dialog>
        </>
    );
}