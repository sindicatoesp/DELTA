import { Outlet, useLoaderData, useNavigate , Link } from "react-router";
import { LoaderFunctionArgs } from "react-router";



export async function loader(args: LoaderFunctionArgs) {
	let { params } = args;
	let parent = params.parent || "unknown";
	return {
		parent,
	};
}

export default function Parent() {
	const ld = useLoaderData<typeof loader>();


	const navigate = useNavigate();

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		navigate(event.target.value);
	};

	return (
		<div>
			<h1>Parent</h1>
			<div>
				<h2>Using HTML form select</h2>
				<label htmlFor="parent-select">Select Parent:</label>
				<select id="parent-select" onChange={handleSelectChange}>
					<option
						value={"/examples/multiple-loaders/parent/parent1/child"}
					>
						Parent 1
					</option>
					<option
						value={"/examples/multiple-loaders/parent/parent2/child"}
					>
						Parent 2
					</option>
				</select>
			</div>

			<div>
				<h2>Using Link to</h2>
				<Link to="/examples/multiple-loaders/parent/parent1/child"
				>
					Parent 1
				</Link>
				<Link to="/examples/multiple-loaders/parent/parent2/child"
				>
					Parent 2
				</Link>
			</div>
			<p>{ld.parent}</p>
			<hr />
			<Outlet context="example1" />
		</div>
	);
}
