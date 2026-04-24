import type { SectorListItem } from "~/modules/sectors/domain/entities/sector";

export interface SectorTreeNode {
	key: string;
	label: string;
	children?: SectorTreeNode[];
}

export interface TreeCheckboxState {
	checked?: boolean;
	partialChecked?: boolean;
}

export type TreeSelectionKeys = Record<string, TreeCheckboxState>;

export function buildSectorTreeNodes(
	sectors: SectorListItem[],
): SectorTreeNode[] {
	const map = new Map<string, SectorTreeNode>();
	const roots: SectorTreeNode[] = [];

	for (const sector of sectors) {
		map.set(sector.id, {
			key: sector.id,
			label: sector.sectorname || "Unnamed",
			children: [],
		});
	}

	for (const sector of sectors) {
		const node = map.get(sector.id);
		if (!node) continue;

		if (sector.parentId) {
			const parent = map.get(sector.parentId);
			if (parent) {
				parent.children = parent.children ?? [];
				parent.children.push(node);
				continue;
			}
		}

		roots.push(node);
	}

	return roots;
}

export function sectorIdsToTreeSelection(sectorIds: string): TreeSelectionKeys {
	const keys: TreeSelectionKeys = {};
	const ids = sectorIds
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);

	for (const id of ids) {
		keys[id] = { checked: true, partialChecked: false };
	}

	return keys;
}

export function treeSelectionToSectorIds(selection: TreeSelectionKeys): string {
	return Object.entries(selection)
		.filter(([, value]) => !!value?.checked)
		.map(([key]) => key)
		.join(",");
}
