"use strict";

var _require = require("./util"),
    get_tag = _require.get_tag,
    tags = _require.tags;

function create_node(isArrayNode) {
	var node = {};
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
	var watchers = node._.watchers;
	watchers[prop] = watchers[prop] || new Set();

	watchers[prop].forEach(function (w) {
		var fn = context._watchers[w];
		if (typeof fn != "function") {
			watchers[prop].delete(w);
		} else {
			context.log("Call watcher:", w, "for prop:", prop);
			fn(node[prop]);
		}
	});
}

function get_node_by_path(path, context) {
	var node = context._rootNode;

	for (var i = 0; i < path.length; i++) {
		var key = path[i];
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
	var valueTag = get_tag(value);
	if (valueTag == tags.REF) {
		commit_node_prop(node, prop, get_node_by_path(value.path, context), context);

		return;
	}

	if (valueTag == tags.OBJECT) {
		var child = node[prop];
		if (get_tag(node[prop]) != tags.OBJECT || node[prop]._.isArray) {
			child = create_node();
		}
		commit_node_prop(node, prop, child, context);
		merge_node(child, value, context);
		return;
	}

	if (valueTag == tags.ARRAY) {
		var _child = create_node(true);
		commit_node_prop(node, prop, _child, context);
		for (var i = 0; i < value.length; i++) {
			assign_node_prop(_child, i, value[i], context);
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
	var props = Object.keys(value);
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		assign_node_prop(node, prop, value[prop], context);
	}
}

function delete_path(node, path, context) {
	var prop = void 0;

	for (var i = 0; i < path.length - 1; i++) {
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
		var props = Object.keys(node);
		for (var _i = 0; _i < props.length; _i++) {
			commit_node_prop(node, props[_i], undefined, context);
		}
		node._.deleted = true;
	}
}

module.exports = {
	merge_node: merge_node,
	create_node: create_node,
	delete_path: delete_path
};