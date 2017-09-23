const { get_tag, tags } = require("./util");

function handle_map_op(node, op, watcher, context) {
	let nodes = [];
	const props = Object.keys(node);
	const query = op._;

	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		const propTag = get_tag(node[prop]);

		if (
			propTag == tags.DELETED ||
			propTag == tags.NULL ||
			propTag == tags.UNDEFINED
		)
			continue;

		if (propTag != tags.OBJECT) {
			nodes.push(get_node_prop(node, prop, watcher, context));
		} else {
			nodes.push(get_query(node, prop, query, watcher, context));
		}
	}
	watch_add_remove_prop(node, watcher, context);
	if (typeof context.state.onMapCallback == "function") {
		nodes = context.state.onMapCallback(op, nodes) || nodes;
	}

	return nodes;
}

function watch_add_remove_prop(node, watcher, context) {
	const meta = node._;
	if (watcher) {
		meta.watchers["_"] = meta.watchers["_"] || new Set();
		meta.watchers["_"].add(watcher);
		context.log("Add watcher:", watcher, "for add/remove prop");
	}
}

function get_node_prop(node, prop, watcher, context) {
	const meta = node._;

	if (watcher) {
		meta.watchers[prop] = meta.watchers[prop] || new Set();
		meta.watchers[prop].add(watcher);
		context.log("Add watcher:", watcher, "for prop:", prop);
	}

	meta.readers.forEach(reader => {
		const fn = context._readers[reader];
		if (typeof fn != "function") {
			meta.readers.delete(reader);
		} else {
			fn(node, prop);
		}
	});

	return node[prop];
}
/**
 * Assume node is object, return all primitive prop
 * @param {*} node 
 * @param {*} watcher 
 * @param {*} context 
 */
function get_all_node_props(node, watcher, context) {
	const result = {};
	const props = Object.keys(node);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		const tag = get_tag(node[prop]);

		if (tag != tags.DELETED && tag != tags.OBJECT) {
			result[prop] = get_node_prop(node, prop, watcher, context);
		}
	}
	watch_add_remove_prop(node, watcher, context);
	return result;
}

/**
 * Assume node is object and query is any, resolve query for node prop
 * @param {*} node 
 * @param {*} prop 
 * @param {*} watcher 
 * @param {*} context 
 */
function get_query_node_prop(node, prop, query, watcher, context) {
	const propTag = get_tag(node[prop]);

	if (propTag == tags.DELETED) {
		return;
	}
	// ignore query if node prop is primitive
	if (propTag != tags.OBJECT) {
		return get_node_prop(node, prop, watcher, context);
	}

	return get_query(node, prop, query, watcher, context);
}

/**
 * Assume node is object and query is any, resolve query
 * @param {*} node 
 * @param {*} query 
 * @param {*} watcher 
 * @param {*} context 
 */
function get_query(node, prop, query, watcher, context) {
	if (prop != null) {
		node = get_node_prop(node, prop, watcher, context);
	}
	const result = {};

	const queryTag = get_tag(query);

	// 1 return all primitive node prop
	if (query == 1) {
		return get_all_node_props(node, watcher, context);
	}

	if (queryTag != tags.OBJECT) {
		throw new Error("Invalid query: " + query);
	}

	// {} return all primitive node prop
	const props = Object.keys(query);
	if (props.length == 0) {
		return get_all_node_props(node, watcher, context);
	}

	// { _: any } return map op
	if (query._) {
		return handle_map_op(node, query, watcher, context);
	}

	// nested query
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		result[prop] = get_query_node_prop(
			node,
			prop,
			query[prop],
			watcher,
			context
		);
	}
	return result;
}

module.exports = {
	get_query
};
