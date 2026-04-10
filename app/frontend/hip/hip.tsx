interface HipHazardModel {
	hipType?: { name?: string; name_en?: string } | null;
	hipCluster?: { name?: string; name_en?: string } | null;
	hipHazard?: { name?: string; name_en?: string } | null;
}

export function HipHazardInfo({
	model,
}: {
	model: HipHazardModel;
}) {
	if (!model.hipType && !model.hipCluster && !model.hipHazard) {
		return null;
	}
	return (
		<div>
			<h5>{"Hazard classification"}</h5>
			<ul>
				{model.hipType && (
					<li>
						{"Type"}
						: {model.hipType.name ?? model.hipType.name_en ?? ""}
					</li>
				)}
				{model.hipCluster && (
					<li>
						{"Cluster"}
						: {model.hipCluster.name ?? model.hipCluster.name_en ?? ""}
					</li>
				)}
				{model.hipHazard && (
					<li>
						{"Hazard"}
						: {model.hipHazard.name ?? model.hipHazard.name_en ?? ""}
					</li>
				)}
			</ul>
		</div>
	);
}
