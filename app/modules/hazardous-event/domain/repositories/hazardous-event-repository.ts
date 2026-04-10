import type {
	HazardousEvent,
	HazardousEventApprovalStatus,
	HazardousEventLifecycleStatus,
	HazardousEventListItem,
	HazardousEventWriteModel,
} from "~/modules/hazardous-event/domain/entities/hazardous-event";

export interface HazardousEventPagination {
	totalItems: number;
	itemsOnThisPage: number;
	page: number;
	pageSize: number;
	extraParams: Record<string, string[]>;
}

export interface ListHazardousEventsQuery {
	countryAccountsId: string;
	search?: string;
	hipHazardId?: string;
	hipClusterId?: string;
	hipTypeId?: string;
	approvalStatus?: HazardousEventApprovalStatus;
	hazardousEventStatus?: HazardousEventLifecycleStatus;
	fromDate?: string;
	toDate?: string;
	recordOriginator?: string;
	pagination: {
		page: number;
		pageSize: number;
	};
}

export interface ListHazardousEventsResult {
	items: HazardousEventListItem[];
	pagination: HazardousEventPagination;
}

export interface HazardousEventRepositoryPort {
	create(data: HazardousEventWriteModel): Promise<HazardousEvent | null>;
	findById(
		id: string,
		countryAccountsId: string,
	): Promise<HazardousEvent | null>;
	findByImportId(
		apiImportId: string,
		countryAccountsId: string,
	): Promise<HazardousEvent | null>;
	updateById(
		id: string,
		countryAccountsId: string,
		data: Partial<HazardousEventWriteModel>,
	): Promise<HazardousEvent | null>;
	deleteById(
		id: string,
		countryAccountsId: string,
	): Promise<HazardousEvent | null>;
	listByCountryAccountsId(
		args: ListHazardousEventsQuery,
	): Promise<ListHazardousEventsResult>;
}
