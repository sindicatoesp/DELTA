import { Link } from 'react-router';
import { authLoaderWithPerm } from "~/utils/auth";
import { MainContainer } from "~/frontend/container";



export const loader = authLoaderWithPerm("ViewApiDocs", async () => {
	return {};
});

export default function Screen() {

	return (
		<MainContainer title="API Expoints">
			<>
				<ul>
					<li>
						<Link to="/api/hips/type">
							HIPS Type
						</Link>
					</li>
					<li>
						<Link to="/api/hips/cluster">
							HIPS Cluster
						</Link>
					</li>
					<li>
						<Link to="/api/hips/hazard">
							HIPS Hazard
						</Link>
					</li>
				</ul>
			</>
		</MainContainer>
	);
}
