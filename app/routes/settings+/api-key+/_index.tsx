import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { DataMainLinks } from "~/frontend/data_screen";
import { MainContainer } from "~/frontend/container";
import { Pagination } from "~/frontend/pagination/view";

import { ActionLinks } from "~/frontend/form";

import type { ApiKeyListItem } from "~/modules/api-keys/domain/entities/api-key";
import { makeListApiKeysUseCase } from "~/modules/api-keys/api-keys-module.server";
import { PERMISSIONS } from "~/frontend/user/roles";
import { requirePermission } from "~/utils/auth";
import { route } from "~/frontend/api_key";
import { formatDate } from "~/utils/date";
import { getCountryAccountsIdFromSession } from "~/utils/session";

import { LangLink } from "~/utils/link";

// Define interface for enhanced API key with status information
type EnhancedApiKey = ApiKeyListItem;

export async function loader({ request }: LoaderFunctionArgs) {
	await requirePermission(request, PERMISSIONS.API_KEYS_EDIT);
	const countryAccountsId = await getCountryAccountsIdFromSession(request);
	const url = new URL(request.url);
	const pageRaw = parseInt(url.searchParams.get("page") || "1", 10);
	const pageSizeRaw = parseInt(url.searchParams.get("pageSize") || "50", 10);
	const page = Math.max(1, Number.isNaN(pageRaw) ? 1 : pageRaw);
	const pageSize = Math.max(1, Number.isNaN(pageSizeRaw) ? 50 : pageSizeRaw);

	const data = await makeListApiKeysUseCase().execute({
		countryAccountsId,
		page,
		pageSize,
	});

	return { data };
}

// Define a custom interface for our ApiKeyDataScreen props
interface ApiKeyDataScreenProps {
	plural: string;
	isPublic?: boolean;
	baseRoute: string;
	searchParams?: URLSearchParams;
	columns: string[];
	items: EnhancedApiKey[];
	paginationData: any;
	renderRow: (item: EnhancedApiKey, baseRoute: string) => React.ReactNode;
	csvExportLinks?: boolean;
	headerElement?: React.ReactNode;
	beforeListElement?: React.ReactNode;
	hideMainLinks?: boolean;
}

// Custom component that wraps DataScreen but hides the status legend
function ApiKeyDataScreen(props: ApiKeyDataScreenProps) {
	const pagination = Pagination({
		...props.paginationData,
	});
	return (
		<MainContainer title={props.plural}>
			<>
				{props.headerElement}
				<DataMainLinks
					searchParams={props.searchParams}
					isPublic={false}
					baseRoute={props.baseRoute}
					csvExportLinks={props.csvExportLinks}
					addNewLabel={"Add new API key"}
				/>
				{props.beforeListElement}
				{props.paginationData.totalItems ? (
					<>
						{/* Status legend is intentionally removed here */}
						<table className="dts-table">
							<thead>
								<tr>
									{props.columns.map((col, index) => (
										<th key={index}>{col}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{props.items.map((item) =>
									props.renderRow(item, props.baseRoute),
								)}
							</tbody>
						</table>
						{pagination}
					</>
				) : (
					"No data found"
				)}
			</>
		</MainContainer>
	);
}

export default function Data() {
	const ld = useLoaderData<typeof loader>();


	const { items, pagination } = ld.data;
	return ApiKeyDataScreen({
		plural: "API keys",
		baseRoute: route,
		columns: [
			"ID",
			"Created at",
			"Managed by",
			"Key Name",
			"Status",
			"Actions",
		],
		items: items as EnhancedApiKey[],
		paginationData: pagination,
		renderRow: (item: EnhancedApiKey, route: string) => {
			// Determine status display
			const statusStyle = item.isActive
				? { color: "green", fontWeight: "bold" }
				: { color: "red", fontWeight: "bold" };
			const statusText = item.isActive
				? "Active"
				: "Disabled";

			// Show assigned user if applicable
			const displayName = item.cleanName || item.name;
			const assignmentInfo = item.assignedUserId
				? " (Assigned to user: {userId})"
				: "";

			return (
				<tr key={item.id}>
					<td>
						<LangLink lang="en" to={`${route}/${item.id}`}>
							{item.id}
						</LangLink>
					</td>
					<td>{formatDate(item.createdAt)}</td>
					<td>{item.managedByUser.email}</td>
					<td title={item.issues.join("\n")}>
						{displayName}
						{assignmentInfo}
					</td>
					<td>
						<span style={statusStyle}>{statusText}</span>
					</td>
					<td>
						<ActionLinks route={route} id={item.id} />
					</td>
				</tr>
			);
		},
	});
}
