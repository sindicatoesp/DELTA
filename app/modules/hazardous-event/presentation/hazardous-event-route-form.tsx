import type { ReactNode } from "react";
import { useActionData, useLocation, useNavigate } from "react-router";
import { Dialog } from "primereact/dialog";

import type { HazardousEventFields } from "~/backend.server/models/event";
import type { Errors, FormResponse } from "~/frontend/form";

export function useHazardousEventFormState(
    initialFields: Partial<HazardousEventFields>,
) {
    const actionData =
        useActionData() as FormResponse<HazardousEventFields> | undefined;

    let fields: Partial<HazardousEventFields> = initialFields;
    let errors: Errors<HazardousEventFields> = {};

    if (actionData) {
        fields = actionData.data;
        if (!actionData.ok) {
            errors = actionData.errors;
        }
    }

    return { fields, errors };
}

function getHazardousEventsBasePath(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length >= 2) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === "edit" || lastSegment === "delete") {
            return `/${segments.slice(0, -2).join("/")}`;
        }
    }

    if (segments[segments.length - 1] === "new") {
        return `/${segments.slice(0, -1).join("/")}`;
    }

    const previousSegment = segments[segments.length - 2];
    if (previousSegment === "hazardous-event") {
        return `/${segments.slice(0, -1).join("/")}`;
    }

    return pathname;
}

export function useHazardousEventDialogCloseTarget(closeTo?: string) {
    const location = useLocation();

    if (closeTo) {
        return closeTo;
    }

    const basePath = getHazardousEventsBasePath(location.pathname);
    return `${basePath}${location.search}`;
}

type HazardousEventDialogRouteProps = {
    header?: string;
    children: ReactNode;
    closeTo?: string;
    width?: string;
    maxWidth?: string;
};

export function HazardousEventDialogRoute({
    header,
    children,
    closeTo,
    width = "95vw",
    maxWidth = "1200px",
}: HazardousEventDialogRouteProps) {
    const navigate = useNavigate();
    const closeTarget = useHazardousEventDialogCloseTarget(closeTo);

    return (
        <Dialog
            header={header}
            showHeader={Boolean(header)}
            visible
            onHide={() => navigate(closeTarget)}
            style={{ width, maxWidth }}
            modal
            draggable={false}
        >
            {children}
        </Dialog>
    );
}
