import React from "react";
import FilterLink from "./FilterLink";

const Footer = ({ state }) => (
	<p>
		Show:{" "}
		<FilterLink state={state} filter="SHOW_ALL">
			All
		</FilterLink>
		{", "}
		<FilterLink state={state} filter="SHOW_ACTIVE">
			Active
		</FilterLink>
		{", "}
		<FilterLink state={state} filter="SHOW_COMPLETED">
			Completed
		</FilterLink>
	</p>
);

export default Footer;
