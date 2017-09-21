import React from "react";
import { connect, update_parent_name, update_child_name } from "../store.js";

function Parent({ parent }) {
	if (!parent) return null;
	const onChange = evt => {
		update_parent_name(evt.target.value);
	};
	return (
		<div>
			<h2>I'm {parent.name}</h2>
			<p>My child is {parent.child.name}</p>
			<p>
				Change my name: <input type="text" onChange={onChange} />
			</p>
		</div>
	);
}

function Child({ child }) {
	if (!child) return null;
	const onChange = evt => {
		update_child_name(evt.target.value);
	};
	return (
		<div>
			<h2>I'm {child.name}</h2>
			<p>My parent is {child.parent.name}</p>
			<p>
				Change my name: <input type="text" onChange={onChange} />
			</p>
		</div>
	);
}

function Sample({ data }) {
	return (
		<div>
			<Parent parent={data.parent} />
			<Child child={data.child} />
		</div>
	);
}

export default connect({
	parent: { name: 1, child: { name: 1 } },
	child: { name: 1, parent: { name: 1 } }
})(Sample);
