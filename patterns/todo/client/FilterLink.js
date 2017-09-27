import React from "react";
import { setVisibilityFilter } from "./actions";
import Link from "./Link";
import gstate from "./gstate";

const FilterLink = gstate(
	{
		filter: 1
	},
	(props, data, children) => {
		data = data || {
			active: false
		};
		return (
			<Link
				active={props.filter === data.filter}
				onClick={() => setVisibilityFilter(props.state, props.filter)}
				children={props.children}
			/>
		);
	}
);

export default FilterLink;
