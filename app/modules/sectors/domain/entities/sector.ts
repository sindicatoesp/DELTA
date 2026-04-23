export interface SectorListItem {
	id: string;
	sectorname: string;
	level: number;
	description: string | null;
	parentId: string | null;
	createdAt: Date | string | null;
	parentName: string | null;
}

export interface SectorsPageData {
	sectors: SectorListItem[];
}
