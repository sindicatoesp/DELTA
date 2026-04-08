import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";

import { HazardEventHeader } from "~/components/EventCounter";
import { MainContainer } from "~/frontend/container";
import { HazardousEventFilters } from "~/frontend/events/hazardevent-filters";
import { NavSettings } from "~/frontend/components/nav-settings";
import { approvalStatusKeyToLabel } from "~/frontend/approval";
import { formatDateDisplay } from "~/utils/date";

type HazardousEventItem = {
    id: string;
    approvalStatus: string;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
    hipHazard?: { name?: string | null } | null;
    hipCluster?: { name?: string | null } | null;
    hipType?: { name?: string | null } | null;
};

type HazardousEventsManagementPageProps = {
    instanceName: string;
    isPublic: boolean;
    filters: {
        hipHazardId: string;
        hipClusterId: string;
        hipTypeId: string;
        search: string;
        fromDate?: string;
        toDate?: string;
        recordingOrganization?: string;
        hazardousEventStatus?: string;
        recordStatus?: string;
        viewMyRecords?: boolean;
        pendingMyAction?: boolean;
    };
    hip: unknown;
    organizations: Array<{ id: string; name: string }>;
    data: {
        items: HazardousEventItem[];
        pagination: {
            totalItems: number;
            page: number;
            pageSize: number;
        };
    };
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    userRole: string | null;
};

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

    return pathname;
}

function hazardName(item: HazardousEventItem) {
    if (item.hipHazard?.name) return item.hipHazard.name;
    if (item.hipCluster?.name) return item.hipCluster.name;
    if (item.hipType?.name) return item.hipType.name;
    return "";
}

function canDeleteItem(item: HazardousEventItem) {
    const status = item.approvalStatus.toLowerCase();
    return status !== "validated" && status !== "published";
}

export default function HazardousEventsManagementPage(
    props: HazardousEventsManagementPageProps,
) {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = useMemo(
        () => getHazardousEventsBasePath(location.pathname),
        [location.pathname],
    );

    const navSettings = <NavSettings userRole={props.userRole ?? undefined} />;

    const withCurrentSearch = (path: string) =>
        location.search ? `${path}${location.search}` : path;

    const updatePaginationParams = (nextPage: number, nextPageSize: number) => {
        const params = new URLSearchParams(location.search);
        params.set("page", String(nextPage));
        params.set("pageSize", String(nextPageSize));
        navigate(`${basePath}?${params.toString()}`);
    };

    const rowActions = (item: HazardousEventItem) => (
        <div className="flex items-center justify-center gap-1">
            {props.canUpdate && (
                <Button
                    type="button"
                    text
                    aria-label={"Edit"}
                    onClick={() =>
                        navigate(withCurrentSearch(`${basePath}/${item.id}/edit`))
                    }
                >
                    <i className="pi pi-pencil" aria-hidden="true" />
                </Button>
            )}
            <Button
                type="button"
                text
                aria-label={"View"}
                onClick={() => navigate(withCurrentSearch(`${basePath}/${item.id}`))}
            >
                <i className="pi pi-eye" aria-hidden="true" />
            </Button>
            {props.canDelete && canDeleteItem(item) && (
                <Button
                    type="button"
                    text
                    severity="danger"
                    aria-label={"Delete"}
                    onClick={() =>
                        navigate(withCurrentSearch(`${basePath}/${item.id}/delete`))
                    }
                >
                    <i className="pi pi-trash" aria-hidden="true" />
                </Button>
            )}
        </div>
    );

    const statusBody = (item: HazardousEventItem) => {
        const status = item.approvalStatus.toLowerCase();
        return (
            <div className="flex items-center gap-2">
                <span
                    className={`dts-status dts-status--${status}`}
                    aria-hidden="true"
                />
                <span>{approvalStatusKeyToLabel(item.approvalStatus)}</span>
            </div>
        );
    };

    return (
        <MainContainer title={"Hazardous events"} headerExtra={navSettings}>
            <>
                <HazardEventHeader
                    totalCount={props.data.pagination.totalItems}
                    instanceName={props.instanceName}
                />

                {!props.isPublic && props.canCreate && (
                    <div className="mb-4 flex w-full justify-end">
                        <Button
                            label={"Add new event"}
                            icon="pi pi-plus"
                            onClick={() => navigate(withCurrentSearch(`${basePath}/new`))}
                        />
                    </div>
                )}

                <HazardousEventFilters
                    hipHazardId={props.filters.hipHazardId}
                    hipClusterId={props.filters.hipClusterId}
                    hipTypeId={props.filters.hipTypeId}
                    fromDate={props.filters.fromDate}
                    toDate={props.filters.toDate}
                    recordingOrganization={props.filters.recordingOrganization}
                    hazardousEventStatus={props.filters.hazardousEventStatus}
                    recordStatus={props.filters.recordStatus}
                    viewMyRecords={props.filters.viewMyRecords}
                    pendingMyAction={props.filters.pendingMyAction}
                    search={props.filters.search}
                    hip={props.hip}
                    organizations={props.organizations}
                    clearFiltersUrl={basePath}
                />

                <section className="mt-4 w-full">
                    <div
                        data-testid="list-table"
                        className="w-full overflow-x-auto [&_.p-datatable]:w-full [&_.p-datatable-wrapper]:w-full [&_.p-datatable-table]:w-full"
                    >
                        <DataTable
                            value={props.data.items}
                            dataKey="id"
                            emptyMessage={"No records found"}
                            className="w-full"
                            tableClassName="w-full min-w-full border-collapse text-sm md:text-base"
                        >
                            <Column
                                header={"Hazard type"}
                                body={(item: HazardousEventItem) => hazardName(item)}
                                headerClassName="bg-gray-100 px-2 py-3 text-left font-medium border-b border-gray-200"
                                bodyClassName="px-2 py-3 border-b border-gray-200"
                            />
                            {!props.isPublic && (
                                <Column
                                    header={"Record status"}
                                    body={statusBody}
                                    headerClassName="bg-gray-100 px-2 py-3 text-left font-medium border-b border-gray-200"
                                    bodyClassName="px-2 py-3 border-b border-gray-200"
                                />
                            )}
                            <Column
                                header={"Hazardous event UUID"}
                                body={(item: HazardousEventItem) => (
                                    <Button
                                        type="button"
                                        link
                                        className="p-0"
                                        onClick={() =>
                                            navigate(withCurrentSearch(`${basePath}/${item.id}`))
                                        }
                                    >
                                        {item.id.slice(0, 5)}
                                    </Button>
                                )}
                                headerClassName="bg-gray-100 px-2 py-3 text-left font-medium border-b border-gray-200"
                                bodyClassName="px-2 py-3 border-b border-gray-200"
                            />
                            <Column
                                header={"Created"}
                                body={(item: HazardousEventItem) =>
                                    formatDateDisplay(item.createdAt, "dd-MM-yyyy")
                                }
                                headerClassName="bg-gray-100 px-2 py-3 text-left font-medium border-b border-gray-200"
                                bodyClassName="px-2 py-3 border-b border-gray-200"
                            />
                            <Column
                                header={"Updated"}
                                body={(item: HazardousEventItem) =>
                                    formatDateDisplay(item.updatedAt, "dd-MM-yyyy")
                                }
                                headerClassName="bg-gray-100 px-2 py-3 text-left font-medium border-b border-gray-200"
                                bodyClassName="px-2 py-3 border-b border-gray-200"
                            />
                            {!props.isPublic && (
                                <Column
                                    header={"Actions"}
                                    body={rowActions}
                                    headerClassName="bg-gray-100 px-2 py-3 text-center font-medium border-b border-gray-200"
                                    bodyClassName="px-2 py-3 border-b border-gray-200 text-center"
                                />
                            )}
                        </DataTable>
                    </div>

                    {props.data.pagination.totalItems > 0 && (
                        <Paginator
                            first={(props.data.pagination.page - 1) * props.data.pagination.pageSize}
                            rows={props.data.pagination.pageSize}
                            totalRecords={props.data.pagination.totalItems}
                            rowsPerPageOptions={[10, 20, 30, 40, 50]}
                            onPageChange={(event) => {
                                updatePaginationParams(event.page + 1, event.rows);
                            }}
                            className="mt-4 !justify-end"
                        />
                    )}
                </section>
            </>
        </MainContainer>
    );
}
