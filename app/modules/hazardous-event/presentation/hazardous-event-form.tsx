import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { useMemo, useState } from "react";
import { Form, Link } from "react-router";

import type { HazardousEvent } from "~/modules/hazardous-event/domain/entities/hazardous-event";

interface HipTypeOption {
    label: string;
    value: string;
}

interface HipClusterOption extends HipTypeOption {
    typeId: string;
}

interface HipHazardOption extends HipTypeOption {
    clusterId: string;
}

interface HazardousEventFormProps {
    title: string;
    submitLabel: string;
    actionError?: string;
    initialValues?: Partial<HazardousEvent>;
    hipHazards?: HipHazardOption[];
    hipClusters?: HipClusterOption[];
    hipTypes?: HipTypeOption[];
}

export default function HazardousEventForm({
    title,
    submitLabel,
    actionError,
    initialValues,
    hipHazards = [],
    hipClusters = [],
    hipTypes = [],
}: HazardousEventFormProps) {
    const [selectedHipTypeId, setSelectedHipTypeId] = useState(initialValues?.hipTypeId || "");
    const [selectedHipClusterId, setSelectedHipClusterId] = useState(initialValues?.hipClusterId || "");
    const [selectedHipHazardId, setSelectedHipHazardId] = useState(initialValues?.hipHazardId || "");

    const hipClusterById = useMemo(() => {
        return new Map(hipClusters.map((cluster) => [cluster.value, cluster]));
    }, [hipClusters]);

    const filteredHipClusters = useMemo(() => {
        if (!selectedHipTypeId) {
            return hipClusters;
        }
        return hipClusters.filter((cluster) => cluster.typeId === selectedHipTypeId);
    }, [hipClusters, selectedHipTypeId]);

    const filteredHipHazards = useMemo(() => {
        if (!selectedHipClusterId) {
            return hipHazards;
        }
        return hipHazards.filter((hazard) => hazard.clusterId === selectedHipClusterId);
    }, [hipHazards, selectedHipClusterId]);

    return (
        <div className="mx-auto max-w-5xl p-4">
            <Card>
                <div className="mb-4 flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
                    <Link to="/hazardous-event">
                        <Button label="Back to list" text size="small" />
                    </Link>
                </div>

                {actionError ? (
                    <div className="mb-4">
                        <Message severity="error" text={actionError} />
                    </div>
                ) : null}

                <Form method="post" className="grid gap-4">
                    <input type="hidden" name="hipTypeId" value={selectedHipTypeId} />
                    <input type="hidden" name="hipClusterId" value={selectedHipClusterId} />
                    <input type="hidden" name="hipHazardId" value={selectedHipHazardId} />

                    <div className="grid gap-1">
                        <label htmlFor="recordOriginator" className="text-sm font-medium text-slate-700">
                            Record Originator
                        </label>
                        <InputText
                            id="recordOriginator"
                            name="recordOriginator"
                            defaultValue={initialValues?.recordOriginator || ""}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-1">
                            <label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                                Start Date
                            </label>
                            <InputText
                                id="startDate"
                                name="startDate"
                                type="date"
                                defaultValue={initialValues?.startDate || ""}
                                required
                            />
                        </div>
                        <div className="grid gap-1">
                            <label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                                End Date
                            </label>
                            <InputText
                                id="endDate"
                                name="endDate"
                                type="date"
                                defaultValue={initialValues?.endDate || ""}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="grid gap-1">
                            <label htmlFor="hipTypeId" className="text-sm font-medium text-slate-700">
                                HIP Type
                            </label>
                            <Dropdown
                                id="hipTypeId"
                                options={hipTypes}
                                optionLabel="label"
                                optionValue="value"
                                value={selectedHipTypeId || null}
                                placeholder="Select a type"
                                filter
                                onChange={(e) => {
                                    const nextTypeId = e.value || "";
                                    setSelectedHipTypeId(nextTypeId);
                                    setSelectedHipClusterId("");
                                    setSelectedHipHazardId("");
                                }}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label htmlFor="hipClusterId" className="text-sm font-medium text-slate-700">
                                HIP Cluster
                            </label>
                            <Dropdown
                                id="hipClusterId"
                                options={filteredHipClusters}
                                optionLabel="label"
                                optionValue="value"
                                value={selectedHipClusterId || null}
                                placeholder="Select a cluster"
                                filter
                                onChange={(e) => {
                                    const nextClusterId = e.value || "";
                                    const nextCluster = hipClusterById.get(nextClusterId);
                                    setSelectedHipTypeId(nextCluster?.typeId || "");
                                    setSelectedHipClusterId(nextClusterId);
                                    setSelectedHipHazardId("");
                                }}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label htmlFor="hipHazardId" className="text-sm font-medium text-slate-700">
                                HIP Hazard
                            </label>
                            <Dropdown
                                id="hipHazardId"
                                options={filteredHipHazards}
                                optionLabel="label"
                                optionValue="value"
                                value={selectedHipHazardId || null}
                                placeholder="Select a hazard"
                                filter
                                onChange={(e) => {
                                    const nextHazardId = e.value || "";
                                    const nextHazard = hipHazards.find((hazard) => hazard.value === nextHazardId);
                                    const nextCluster = nextHazard ? hipClusterById.get(nextHazard.clusterId) : undefined;
                                    setSelectedHipTypeId(nextCluster?.typeId || "");
                                    setSelectedHipClusterId(nextHazard?.clusterId || "");
                                    setSelectedHipHazardId(nextHazardId);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <label htmlFor="description" className="text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <InputTextarea
                            id="description"
                            name="description"
                            autoResize
                            rows={4}
                            defaultValue={initialValues?.description || ""}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-1">
                            <label htmlFor="dataSource" className="text-sm font-medium text-slate-700">
                                Data Source
                            </label>
                            <InputText
                                id="dataSource"
                                name="dataSource"
                                defaultValue={initialValues?.dataSource || ""}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label htmlFor="magnitude" className="text-sm font-medium text-slate-700">
                                Magnitude
                            </label>
                            <InputText
                                id="magnitude"
                                name="magnitude"
                                defaultValue={initialValues?.magnitude || ""}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Link to="/hazardous-event">
                            <Button type="button" label="Cancel" outlined />
                        </Link>
                        <Button type="submit" label={submitLabel} />
                    </div>
                </Form>
            </Card>
        </div>
    );
}
