const { node_type, NodeTypes, patch_type, PatchTypes } = require("./util");

/**
 * Create a node 
 * @param {*} [length] 
 */
function create_node(length) {
	const node = {};
	Object.defineProperty(node, "_", {
		value: {
			length: length, //record array length
			watchers: {},
			watcher_key: new Set(),
			watcher_props: new Set(),
			on_watch_callback: undefined
		},
		writable: true,
		enumerable: false
	});

	return node;
}

function notify_node_prop(context, node, prop, tracker) {
	if (!tracker) return;
	const watchers = node._.watchers;
	watchers[prop] = watchers[prop] || new Set();

	watchers[prop].forEach(w => {
		const fn = context.state.watchers[w];
		if (typeof fn != "function") {
			watchers[prop].delete(w);
		} else {
			tracker.watchers.add(fn);
		}
	});
}

function notify_key_prop(context, node, tracker) {
	if (!tracker) return;
	const watchers = node._.watcher_key;

	watchers.forEach(w => {
		const fn = context.state.watchers[w];
		if (typeof fn != "function") {
			watchers.delete(w);
		} else {
			tracker.watchers.add(fn);
		}
	});
}

function notify_add_remove_prop(context, node, tracker) {
	if (!tracker) return;
	const watchers = node._.watcher_props;
	watchers.forEach(w => {
		const fn = context.state.watchers[w];
		if (typeof fn != "function") {
			watchers.delete(w);
		} else {
			tracker.watchers.add(fn);
		}
	});
}

function commit_delete_node_prop(context, node, prop, tracker) {
	notify_node_prop(context, node, prop, tracker);
	notify_add_remove_prop(context, node, tracker);
	delete node[prop];
}

function commit_node_prop(context, node, prop, value, tracker) {
	if (node[prop] === value) return;

	notify_node_prop(context, node, prop, tracker);
	// add node prop
	node[prop] == undefined && notify_add_remove_prop(context, node, tracker);
	node[prop] = value;
}

/**
 * Follow path create node if not existed
 * @param {*} context 
 * @param {*} node 
 * @param {*} keys 
 * @param {*} len 
 * @param {*} tracker 
 */
function create_node_by_path(context, path, len, tracker) {
	let node = context.state.rootNode;
	for (let i = 0; i < len; i++) {
		const k = path[i];
		if (k == "_") continue;
		if (k == "#") {
			node = context.state.rootNode;
			continue;
		}
		if (node_type(node[k]) != NodeTypes.NODE) {
			commit_node_prop(context, node, k, create_node(), tracker);
		}
		node = node[k];
	}
	return node;
}

function apply_delete_patch(context, path, tracker) {
	if (path.length == 0) return; //cannot delete root node

	const len = path.length - 1;
	const prop = path[len];
	let node = context.state.rootNode;
	for (let i = 0; i < len; i++) {
		const k = path[i];
		if (node_type(node[k]) != NodeTypes.NODE) {
			return; // already deleted
		}
		node = node[k];
	}

	const nodeType = node_type(node[prop]);

	if (nodeType == NodeTypes.DELETED_NODE) return;

	if (nodeType == NodeTypes.NODE) {
		const value = node[prop];
		if (value === context.state.rootNode) return;
		const props = Object.keys(value);
		for (let i = 0; i < props.length; i++) {
			commit_delete_node_prop(context, value, props[i], tracker);
		}

		value._.type = NodeTypes.DELETED_NODE;
		notify_key_prop(context, value, tracker);
	}

	commit_delete_node_prop(context, node, prop, tracker);
}

/**
 * Apply single patch 
 * @param {*} context 
 * @param {*} patch 
 * @param {*} [tracker] 
 */
function apply_patch(context, patch, tracker) {
	const path = patch[0];
	if (path.length == 0) return; //ignore replace root node
	const value = patch[1];
	const len = path.length - 1;
	const prop = path[len];

	if (!Array.isArray(value)) {
		const node = create_node_by_path(context, path, len, tracker);
		commit_node_prop(context, node, prop, value, tracker);
		return;
	} else {
		const patchType = value[0];

		if (patchType == PatchTypes.DEL) {
			return apply_delete_patch(context, path, tracker);
		}
		const node = create_node_by_path(context, path, len, tracker);
		if (patchType == PatchTypes.REFERENCE) {
			const refNode = create_node_by_path(
				context,
				value[1],
				value[1].length,
				tracker
			);
			commit_node_prop(context, node, prop, refNode, tracker);
			return;
		}

		if (patchType == PatchTypes.NODE) {
			if (
				value[1] == undefined &&
				node_type(node[prop]) == NodeTypes.NODE
				//&& node[prop]._.length == undefined
			) {
				return;
			}

			const childNode = create_node(value[1]);
			commit_node_prop(context, node, prop, childNode, tracker);
			return;
		}
	}
}

module.exports = {
	apply_patch,
	create_node
};
