import React from "react";
import { connect, store } from "../store.js";

function Parent({ parent }) {
	if (!parent) return null;
	const onChange = evt => {
		store.put({
			parent: {
				name: evt.target.value
			}
		});
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
		store.put({
			child: {
				name: evt.target.value
			}
		});
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

const parent = {
	name: "Giap"
};
const child = {
	name: "Vinh"
};

parent.child = child;
child.parent = parent;
store.put({
	parent,
	child
});

export default connect({
	parent: { name: 1, child: { name: 1 } },
	child: { name: 1, parent: { name: 1 } }
})(Sample);
