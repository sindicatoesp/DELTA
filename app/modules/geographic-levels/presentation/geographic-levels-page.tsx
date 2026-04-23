import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { TabPanel, TabView } from "primereact/tabview";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { VirtualScroller } from "primereact/virtualscroller";

import { MainContainer } from "~/frontend/container";
import { NavSettings } from "~/frontend/components/nav-settings";
import type { DivisionBreadcrumbRow } from "~/backend.server/models/division";
import type { GeographicLevelListItem } from "~/modules/geographic-levels/domain/entities/geographic-level";
import GeographicLevelBreadcrumbs from "~/modules/geographic-levels/presentation/geographic-level-breadcrumbs";

interface GeographicLevelsPageProps {
    langs: Record<string, number>;
    selectedLangs: string[];
    breadcrumbs: DivisionBreadcrumbRow[] | null;
    treeData: unknown[];
    items: GeographicLevelListItem[];
    pagination: {
        totalItems: number;
        itemsOnThisPage: number;
        page: number;
        pageSize: number;
        extraParams: Record<string, string[]>;
    };
    userRole?: string | null;
}

type PrimeTreeNode = {
    key: string;
    label: string;
    rawId: string;
    children: PrimeTreeNode[];
};

type FlattenedTreeItem = {
    node: PrimeTreeNode;
    depth: number;
};

function pickNodeLabel(name: unknown, fallback: string): string {
    if (typeof name === "string" && name.trim()) {
        return name;
    }
    if (name && typeof name === "object") {
        const bag = name as Record<string, string>;
        if (bag.en && String(bag.en).trim()) {
            return String(bag.en);
        }
        const first = Object.values(bag).find((v) => String(v).trim());
        if (first) {
            return String(first);
        }
    }
    return fallback;
}

function normalizeTreeNodes(nodes: unknown[]): PrimeTreeNode[] {
    const arr = Array.isArray(nodes) ? nodes : [];
    return arr.map((item: any) => ({
        key: String(item.id),
        rawId: String(item.id),
        label: pickNodeLabel(item.name, String(item.id)),
        children: normalizeTreeNodes(item.children || []),
    }));
}

export default function GeographicLevelsPage({
    langs,
    selectedLangs,
    breadcrumbs,
    treeData,
    items,
    pagination,
    userRole,
}: GeographicLevelsPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
    const [filterValue, setFilterValue] = useState("");
    const navSettings = <NavSettings userRole={userRole ?? undefined} />;
    const treeNodes = useMemo(() => normalizeTreeNodes(treeData), [treeData]);

    const sortedLangs = useMemo(
        () => Object.entries(langs).sort(([a], [b]) => a.localeCompare(b)),
        [langs],
    );

    const updateQuery = (overrides: Record<string, string | number>) => {
        const params = new URLSearchParams(location.search);
        for (const [key, value] of Object.entries(overrides)) {
            params.set(key, String(value));
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const flattenedNodes = useMemo(() => {
        const result: FlattenedTreeItem[] = [];
        const stack: FlattenedTreeItem[] = treeNodes
            .map((n) => ({ node: n, depth: 0 }))
            .reverse();

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) continue;
            result.push(current);

            if (expandedKeys[current.node.key] && current.node.children?.length) {
                for (let i = current.node.children.length - 1; i >= 0; i--) {
                    stack.push({ node: current.node.children[i], depth: current.depth + 1 });
                }
            }
        }

        return result;
    }, [treeNodes, expandedKeys]);

    const filteredNodes = useMemo(() => {
        if (!filterValue.trim()) return flattenedNodes;

        const lowerFilter = filterValue.toLowerCase();
        const nodesToInclude = new Set<string>();
        const matchingIndices: number[] = [];

        for (let i = 0; i < flattenedNodes.length; i++) {
            if (flattenedNodes[i].node.label.toLowerCase().includes(lowerFilter)) {
                matchingIndices.push(i);
                nodesToInclude.add(flattenedNodes[i].node.key);
            }
        }

        for (const matchIndex of matchingIndices) {
            let currentDepth = flattenedNodes[matchIndex].depth;
            for (let i = matchIndex - 1; i >= 0; i--) {
                const item = flattenedNodes[i];
                if (item.depth < currentDepth) {
                    nodesToInclude.add(item.node.key);
                    currentDepth = item.depth;
                    if (currentDepth === 0) break;
                }
            }
        }

        return flattenedNodes.filter((item) => nodesToInclude.has(item.node.key));
    }, [flattenedNodes, filterValue]);

    useEffect(() => {
        if (!filterValue.trim()) return;

        const lowerFilter = filterValue.toLowerCase();
        const nextExpanded: Record<string, boolean> = {};
        const parentMap = new Map<string, PrimeTreeNode>();

        const stack = [...treeNodes];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;

            if (node.label.toLowerCase().includes(lowerFilter)) {
                nextExpanded[node.key] = true;
                let parent = parentMap.get(node.key);
                while (parent) {
                    nextExpanded[parent.key] = true;
                    parent = parentMap.get(parent.key);
                }
            }

            for (const child of node.children || []) {
                parentMap.set(child.key, node);
                stack.push(child);
            }
        }

        setExpandedKeys(nextExpanded);
    }, [filterValue, treeNodes]);

    const expandAll = () => {
        const nextExpanded: Record<string, boolean> = {};
        const stack = [...treeNodes];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;
            if (node.children?.length) {
                nextExpanded[node.key] = true;
                stack.push(...node.children);
            }
        }
        setExpandedKeys(nextExpanded);
    };

    const collapseAll = () => setExpandedKeys({});

    const linkToChildren = (item: GeographicLevelListItem) =>
        item.hasChildren ? `?parent=${item.id}` : "";

    const clickableBody = (item: GeographicLevelListItem, value: string) => {
        const childLink = linkToChildren(item);
        return childLink ? (
            <button
                type="button"
                onClick={() => navigate(`/settings/geography${childLink}`)}
                className="text-left text-sky-700 hover:text-sky-900 hover:underline"
            >
                {value}
            </button>
        ) : (
            <span>{value}</span>
        );
    };

    const actionsBody = (item: GeographicLevelListItem) => (
        <div className="flex items-center justify-end gap-1">
            <Button
                type="button"
                text
                aria-label="View"
                onClick={() => navigate(`/settings/geography/${item.id}`)}
            >
                <i className="pi pi-eye" aria-hidden="true" />
            </Button>
            <Button
                type="button"
                text
                aria-label="Edit"
                onClick={() => navigate(`/settings/geography/${item.id}/edit`)}
            >
                <i className="pi pi-pencil" aria-hidden="true" />
            </Button>
        </div>
    );

    return (
        <MainContainer title={"Geographic levels"} headerExtra={navSettings}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Geographic levels</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Browse the hierarchy in tree or table form, and keep CSV upload/export available.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="button"
                            label="Export CSV"
                            icon="pi pi-download"
                            severity="secondary"
                            outlined
                            onClick={() => navigate("/settings/geography/csv-export")}
                        />
                        <Button
                            type="button"
                            label="Upload CSV"
                            icon="pi pi-upload"
                            onClick={() => navigate("/settings/geography/upload")}
                        />
                    </div>
                </div>

                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    <TabPanel header="Tree view">
                        <Card className="shadow-sm">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    outlined
                                    size="small"
                                    icon="pi pi-plus"
                                    className="w-full sm:w-auto"
                                    label="Expand All"
                                    onClick={expandAll}
                                />
                                <Button
                                    type="button"
                                    outlined
                                    size="small"
                                    icon="pi pi-minus"
                                    className="w-full sm:w-auto"
                                    label="Collapse All"
                                    onClick={collapseAll}
                                />
                                <div className="relative w-full sm:w-72">
                                    <InputText
                                        placeholder="Search..."
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        className="w-full pr-10"
                                    />
                                    {filterValue ? (
                                        <button
                                            type="button"
                                            onClick={() => setFilterValue("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <i className="pi pi-times" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            <VirtualScroller
                                items={filteredNodes}
                                itemSize={36}
                                scrollHeight="420px"
                                className="w-full rounded-md border border-slate-200 bg-white"
                                itemTemplate={(item: FlattenedTreeItem) => {
                                    const { node, depth } = item;
                                    const isExpanded = !!expandedKeys[node.key];
                                    const hasChildren = node.children?.length > 0;

                                    return (
                                        <div
                                            key={node.key}
                                            className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-sky-50"
                                            style={{ paddingLeft: `${depth * 20 + 12}px` }}
                                        >
                                            {hasChildren ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = { ...expandedKeys };
                                                        if (isExpanded) {
                                                            delete next[node.key];
                                                        } else {
                                                            next[node.key] = true;
                                                        }
                                                        setExpandedKeys(next);
                                                    }}
                                                    className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200"
                                                >
                                                    <i className={`pi ${isExpanded ? "pi-chevron-down" : "pi-chevron-right"} text-xs`} />
                                                </button>
                                            ) : (
                                                <span className="inline-block h-5 w-5" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/settings/geography/${node.rawId}/edit?view=tree`)}
                                                className="text-left text-slate-800 hover:text-sky-700 hover:underline"
                                            >
                                                {node.label}
                                            </button>
                                        </div>
                                    );
                                }}
                            />
                        </Card>
                    </TabPanel>
                    <TabPanel header="Table view">
                        {pagination.totalItems > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3">
                                    <GeographicLevelBreadcrumbs rows={breadcrumbs} />
                                    <div className="flex flex-wrap gap-2">
                                        {sortedLangs.map(([lang, count]) => (
                                            <Tag
                                                key={lang}
                                                value={`${lang.toUpperCase()} (${count})`}
                                                severity={selectedLangs.includes(lang) ? "info" : "secondary"}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <DataTable
                                        value={items}
                                        dataKey="id"
                                        emptyMessage="No data found"
                                        tableClassName="min-w-full"
                                    >
                                        <Column
                                            header="ID"
                                            body={(item: GeographicLevelListItem) => clickableBody(item, item.id)}
                                        />
                                        <Column
                                            header="National ID"
                                            body={(item: GeographicLevelListItem) =>
                                                clickableBody(item, item.nationalId || "-")
                                            }
                                        />
                                        {selectedLangs.map((lang) => (
                                            <Column
                                                key={lang}
                                                header={lang.toUpperCase()}
                                                body={(item: GeographicLevelListItem) =>
                                                    clickableBody(item, item.name[lang] || "-")
                                                }
                                            />
                                        ))}
                                        <Column
                                            header=""
                                            body={actionsBody}
                                            headerClassName="text-right"
                                            bodyClassName="text-right"
                                        />
                                    </DataTable>
                                </div>

                                <Paginator
                                    first={(pagination.page - 1) * pagination.pageSize}
                                    rows={pagination.pageSize}
                                    totalRecords={pagination.totalItems}
                                    rowsPerPageOptions={[10, 20, 50]}
                                    onPageChange={(e) =>
                                        updateQuery({ page: e.page + 1, pageSize: e.rows })
                                    }
                                />
                            </div>
                        ) : (
                            <Message
                                severity="info"
                                content={
                                    <div className="flex flex-col gap-3">
                                        <span>
                                            No administrative divisions configured. Please upload CSV with data.
                                        </span>
                                        <a href="/assets/division_sample.zip" className="font-medium text-sky-700 underline">
                                            See example
                                        </a>
                                    </div>
                                }
                            />
                        )}
                    </TabPanel>
                </TabView>
            </div>
        </MainContainer>
    );
}
