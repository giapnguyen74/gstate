import { setVisibilityFilter } from "./actions";
import Link from "./Link";
import gstate from "./gstate";

const FilterLink = gstate(
	{
		filter: 1
	},
	(props, data) => {
		return (
			<Link
				active={props.filter === data.filter}
				onClick={() => setVisibilityFilter(props.state, props.filter)}
			/>
		);
	}
);

export default FilterLink;
