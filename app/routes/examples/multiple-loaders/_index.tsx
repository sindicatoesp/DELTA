import { Link } from 'react-router';
import { authLoaderWithPerm } from "~/utils/auth";
import { MainContainer } from "~/frontend/container";



export const loader = authLoaderWithPerm("ViewData", async () => {
	return {};
});

export default function Screen() {


	return (
		<MainContainer title="Example">
			<div>
				<Link to="/examples/multiple-loaders/parent/parent1/child"
				>
					Example
				</Link>
			</div>
		</MainContainer>
	);
}
