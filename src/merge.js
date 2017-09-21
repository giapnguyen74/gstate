const { get_tag } = require("./util");

function is_ref_value(value) {
	return value && value._ == "ref";
}

function create_node(isArrayNode) {
	const node = {};
	Object.defineProperty(node, "_", {
		value: {
			isArray: isArrayNode,
			watchers: {},
			readers: new Set()
		},
		writable: true
	});
	return node;
}

function notify_node_prop_changed(node, prop, context) {
	const watchers = node._.watchers;
	watchers[prop] = watchers[prop] || new Set();

	watchers[prop].forEach(w => {
		const fn = context._watchers[w];
		if (typeof fn != "function") {
			watchers[prop].delete(w);
		} else {
			context.log("Call watcher:", w, "for prop:", prop);

			fn(node[prop]);
		}
	});
}

function commit_node_prop(node, prop, value, context) {
	if (node[prop] === value) return;
	node[prop] = value;
	notify_node_prop_changed(node, prop, context);
}

function get_node_by_path(path, context) {
	let node = context._rootNode;

	for (let i = 0; i < path.length; i++) {
		const key = path[i];
		if (get_tag(node[key]) != "[object Object]") {
			const child = create_node();
			commit_node_prop(node, key, child, context);
		}
		node = node[key];
	}

	return node;
}

function merge_node_prop(node, prop, value, context) {
	if (is_ref_value(value)) {
		const child = get_node_by_path(value.path, context);
		return commit_node_prop(node, prop, child, context);
	}

	const valueTag = get_tag(value);
	if (valueTag == "[object Object]") {
		let child = node[prop];
		if (get_tag(child) != "[object Object]" || child._.isArray) {
			child = create_node();
			commit_node_prop(node, prop, child, context);
		}
		merge_node(child, value, context);
	} else if (valueTag == "[object Array]") {
		const child = create_node(true);
		commit_node_prop(node, prop, child, context);
		for (let i = 0; i < value.length; i++) {
			merge_node_prop(child, i, value[i], context);
		}
	} else {
		commit_node_prop(node, prop, value, context);
	}
}

/**
 * Merge node object with value object
 * @param {*} node 
 * @param {*} value 
 */
function merge_node(node, value, context) {
	const props = Object.keys(value);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		merge_node_prop(node, prop, value[prop], context);
	}
}

function delete_path(node, path, context) {
	let prop;

	for (let i = 0; i < path.length - 1; i++) {
		prop = path[i];
		if (get_tag(node[prop]) != "[object Object]") {
			// Already delete node
			return;
		}
		node = node[prop];
	}

	prop = path[path.length - 1];
	if (get_tag(node[prop]) != "[object Object]") {
		//delete primitive value
		delete node[prop];
		notify_node_prop_changed(node, prop, context);
	} else {
		node = node[prop];
		if (node._.isRoot) {
			// You cannot delete root node
			return;
		}
		const props = Object.keys(node);
		for (let i = 0; i < props.length; i++) {
			delete node[props[i]];
			notify_node_prop_changed(node, props[i], context);
		}
		node._.deleted = true;
	}
}

module.exports = {
	merge_node,
	create_node,
	delete_path
};
