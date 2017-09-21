"use strict";

var _require = require("./util"),
    get_tag = _require.get_tag;

function is_ref_value(value) {
	return value && value._ == "ref";
}

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

function notify_node_prop_changed(node, prop, context) {
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

function commit_node_prop(node, prop, value, context) {
	if (node[prop] === value) return;
	node[prop] = value;
	notify_node_prop_changed(node, prop, context);
}

function get_node_by_path(path, context) {
	var node = context._rootNode;

	for (var i = 0; i < path.length; i++) {
		var key = path[i];
		if (get_tag(node[key]) != "[object Object]") {
			var child = create_node();
			commit_node_prop(node, key, child, context);
		}
		node = node[key];
	}

	return node;
}

function merge_node_prop(node, prop, value, context) {
	if (is_ref_value(value)) {
		var child = get_node_by_path(value.path, context);
		return commit_node_prop(node, prop, child, context);
	}

	var valueTag = get_tag(value);
	if (valueTag == "[object Object]") {
		var _child = node[prop];
		if (get_tag(_child) != "[object Object]" || _child._.isArray) {
			_child = create_node();
			commit_node_prop(node, prop, _child, context);
		}
		merge_node(_child, value, context);
	} else if (valueTag == "[object Array]") {
		var _child2 = create_node(true);
		commit_node_prop(node, prop, _child2, context);
		for (var i = 0; i < value.length; i++) {
			merge_node_prop(_child2, i, value[i], context);
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
	var props = Object.keys(value);
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		merge_node_prop(node, prop, value[prop], context);
	}
}

function delete_path(node, path, context) {
	var prop = void 0;

	for (var i = 0; i < path.length - 1; i++) {
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
		var props = Object.keys(node);
		for (var _i = 0; _i < props.length; _i++) {
			delete node[props[_i]];
			notify_node_prop_changed(node, props[_i], context);
		}
		node._.deleted = true;
	}
}

module.exports = {
	merge_node: merge_node,
	create_node: create_node,
	delete_path: delete_path
};