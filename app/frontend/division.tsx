import { Link } from 'react-router';
import { Form, Field, SubmitButton, FieldErrors } from "~/frontend/form";
import { InsertDivision } from "~/drizzle/schema/divisionTable";
import { DivisionBreadcrumbRow } from "~/backend.server/models/division";
interface DivisionFormProps {
	edit: boolean;
	fields: InsertDivision;
	errors: any;
	breadcrumbs: DivisionBreadcrumbRow[] | null;
}

export function DivisionForm({
	edit,
	fields,
	errors,
	breadcrumbs,
}: DivisionFormProps) {
	return (
		<>
			<h2>{edit ? "Edit division" : "Create division"}</h2>
			<Breadcrumb rows={breadcrumbs} linkLast={true} />
			<Form errors={errors} className="dts-form">
				<Field label={"Parent ID"} extraClassName="dts-form-component">
					<input
						type="text"
						name="parentId"
						defaultValue={fields.parentId ? String(fields.parentId) : ""}
					/>
					<FieldErrors errors={errors} field="parentId" />
				</Field>

				{fields.name &&
					Object.keys(fields.name).map((lang) => (
						<Field
							key={lang}
							label={"Name ({lang})"}
							extraClassName="dts-form-component"
						>
							<input
								type="text"
								name={`names[${lang}]`}
								defaultValue={fields.name?.[lang] || ""}
							/>
							<FieldErrors errors={errors} field={`names.${lang}`} />
						</Field>
					))}

				<div className="dts-form__actions">
					<SubmitButton
						className="mg-button mg-button-primary"
						label={edit ? "Update division" : "Create division"}
					/>
				</div>
			</Form>

			<Link
				lang={"en"}
				to={`/settings/geography${fields.parentId ? "?parent=" + fields.parentId : ""}`}
			>
				{"Back to list"}
			</Link>
		</>
	);
}

type BreadcrumbProps = {
	rows: DivisionBreadcrumbRow[] | null;
	linkLast?: boolean;
};

export function Breadcrumb({ rows, linkLast }: BreadcrumbProps) {
	if (!rows) {
		return null;
	}
	return (
		<nav aria-label="breadcrumb">
			<ol>
				<li key="root">
					<Link lang={"en"} to={`/settings/geography`}>
						Root
					</Link>
				</li>
				{rows.map((row, index) => (
					<li key={row.id}>
						{index < rows.length - 1 || linkLast ? (
							<Link lang={"en"} to={`/settings/geography?parent=${row.id}`}>
								{row.name}
							</Link>
						) : (
							<span>{row.name}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
