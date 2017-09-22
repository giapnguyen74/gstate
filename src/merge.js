const { get_tag, tags } = require("./util");

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

function notify_node_prop(node, prop, context) {
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

function get_node_by_path(path, context) {
	let node = context._rootNode;

	for (let i = 0; i < path.length; i++) {
		const key = path[i];
		if (get_tag(node[key]) != tags.OBJECT) {
			commit_node_prop(node, key, create_node(), context);
		}
		node = node[key];
	}

	return node;
}

function commit_node_prop(node, prop, value, context) {
	if (node[prop] === value) return;
	if (get_tag(value) == tags.UNDEFINED) {
		notify_node_prop(node, "_", context);
		notify_node_prop(node, prop, context);
		delete node[prop];
		return;
	}

	if (get_tag(node[prop] == tags.UNDEFINED)) {
		notify_node_prop(node, "_", context);
	}
	notify_node_prop(node, prop, context);
	node[prop] = value;
}

/**
 * Assume node is object and value is any, assign value into node[prop]
 * @param {*} node 
 * @param {*} prop 
 * @param {*} value 
 * @param {*} context 
 */
function assign_node_prop(node, prop, value, context) {
	const valueTag = get_tag(value);
	if (valueTag == tags.REF) {
		commit_node_prop(
			node,
			prop,
			get_node_by_path(value.path, context),
			context
		);
		return;
	}

	if (valueTag == tags.OBJECT) {
		let child = node[prop];
		if (get_tag(node[prop]) != tags.OBJECT || node[prop]._.isArray) {
			child = create_node();
		}
		commit_node_prop(node, prop, child, context);
		merge_node(child, value, context);
		return;
	}

	if (valueTag == tags.ARRAY) {
		let child = create_node(true);
		commit_node_prop(node, prop, child, context);
		for (let i = 0; i < value.length; i++) {
			assign_node_prop(child, i, value[i], context);
		}
		return;
	}

	commit_node_prop(node, prop, value, context);
}

/**
 * Assume node and value are object, merge value into object
 * @param {*} node 
 * @param {*} value 
 */
function merge_node(node, value, context) {
	const props = Object.keys(value);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		assign_node_prop(node, prop, value[prop], context);
	}
}

function delete_path(node, path, context) {
	let prop;

	for (let i = 0; i < path.length - 1; i++) {
		prop = path[i];
		if (get_tag(node[prop]) != tags.OBJECT) {
			// Already delete node
			return;
		}
		node = node[prop];
	}

	prop = path[path.length - 1];
	if (get_tag(node[prop]) != tags.OBJECT) {
		//delete primitive value
		commit_node_prop(node, prop, undefined, context);
	} else {
		node = node[prop];
		if (node._.isRoot) {
			// You cannot delete root node
			return;
		}
		const props = Object.keys(node);
		for (let i = 0; i < props.length; i++) {
			commit_node_prop(node, props[i], undefined, context);
		}
		node._.deleted = true;
	}
}

module.exports = {
	merge_node,
	create_node,
	delete_path
};
