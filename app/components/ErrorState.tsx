import { Link } from "react-router";
import { Card } from "primereact/card";
import { Button } from "primereact/button";


type ErrorStateProps = {
	title: string;
	message: string;
	actionLabel?: string;
	actionTo?: string;
};

export function ErrorState({ title, message, actionLabel = "Go to home", actionTo = "/" }: ErrorStateProps) {
	return (
		<div className="flex justify-content-center align-items-center surface-ground min-h-screen">
			<Card
				className="w-full shadow-3 border-round-xl p-4"
				style={{ maxWidth: "420px" }}
			>
				<div className="text-center flex flex-column align-items-center gap-3">
					{/* Icon */}
					<i
						className="pi pi-exclamation-triangle"
						style={{ fontSize: "3rem", color: "var(--red-500)" }}
					/>

					{/* Title */}
					<h2 className="m-0">{title}</h2>

					{/* Message */}
					<p className="m-0 text-color-secondary">{message}</p>

					<Link to={actionTo}>
						<Button
							label={actionLabel}
							icon="pi pi-home"
							className="mt-3"
							outlined
						/>
					</Link>
				</div>
			</Card>
		</div>
	);
}

