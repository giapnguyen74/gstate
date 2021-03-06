const { node_type, NodeTypes } = require("./util");

function handle_map_op(context, node, op, options) {
	let nodes = [];
	const props = Object.keys(node);
	const query = op._;

	if (query == "$key") {
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];

			let nodeType = node_type(node[prop]);

			if (nodeType == NodeTypes.NODE) {
				watch_add_key_prop(context, node[prop], options);
			}
			if (nodeType == NodeTypes.DELETED_NODE) {
				continue;
			}
			nodes.push(prop);
		}
		watch_add_remove_prop(context, node, options);
		return nodes;
	}

	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		let value = get_node_prop(context, node, prop, options);
		let nodeType = node_type(value);

		if (nodeType == NodeTypes.NODE) {
			value = get_value_by_query(context, value, query, options);
		}

		if (nodeType == NodeTypes.DELETED_NODE) {
			continue;
		}

		nodes.push(value);
	}

	watch_add_remove_prop(context, node, options);
	if (typeof context.state.onMapCallback == "function") {
		nodes = context.state.onMapCallback(op, nodes) || nodes;
	}

	return nodes;
}

function get_node_prop(context, node, prop, options) {
	const meta = node._;
	if (prop == "_") throw new Error("Underscore property is reserved.");
	if (options.watcher) {
		meta.watchers[prop] = meta.watchers[prop] || new Set();
		meta.watchers[prop].add(options.watcher);
		//context.log("Add watcher:", watcher, "for prop:", prop);
	}

	return node[prop];
}

function watch_add_remove_prop(context, node, options) {
	if (options.watcher) {
		node._.watcher_props.add(options.watcher);
	}
}

function watch_add_key_prop(context, node, options) {
	if (options.watcher) {
		node._.watcher_key.add(options.watcher);
	}
}

function get_all_node_props(context, node, options) {
	const result = {};
	const props = Object.keys(node);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];

		if (node_type(node[prop]) == NodeTypes.VALUE) {
			result[prop] = get_node_prop(context, node, prop, options);
		}
	}
	watch_add_remove_prop(context, node, options);
	return result;
}

function notify_watch_callback(context, node, query, options) {
	if (!options.watcher) return;
	const cb = node._.on_watch_callback;
	if (!cb) return;
	const watcherFn = context.state.watchers[options.watcher];
	if (typeof watcherFn != "function") return;
	watcherFn.watch_callbacks = watcherFn.watch_callbacks || new Set();
	if (watcherFn.watch_callbacks.has(cb)) return;
	setTimeout(() => cb(query, options), 0);
	watcherFn.watch_callbacks.add(cb);
}

function get_value_by_query(context, node, query, options) {
	notify_watch_callback(context, node, query, options);
	if (query === 1) {
		return get_all_node_props(context, node, options);
	}

	// { _: any } return map op
	if (query._) {
		return handle_map_op(context, node, query, options);
	}

	if (typeof query != "object") {
		throw new Error("Invalid query: " + JSON.stringify(query));
	}

	const props = Object.keys(query);
	if (props.length == 0) return get_all_node_props(context, node, options);
	// nested query
	const result = {};
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];

		if (prop == "#") {
			result[prop] = get_value_by_query(
				context,
				context.state.rootNode,
				query[prop],
				options
			);
			continue;
		}
		const propVal = get_node_prop(context, node, prop, options);
		const propType = node_type(propVal);
		if (propType == NodeTypes.VALUE) {
			result[prop] = propVal;
		} else if (propType == NodeTypes.NODE) {
			result[prop] = get_value_by_query(
				context,
				propVal,
				query[prop],
				options
			);
		}
	}
	return result;
}

function get_node_by_path(context, path, options) {
	let node = context.state.rootNode;
	if (path.length == 0) return node;
	const len = path.length - 1;
	for (let i = 0; i < len; i++) {
		const prop = path[i];
		if (prop == "#") {
			node = context.state.rootNode;
			continue;
		}

		node = get_node_prop(context, node, prop, options);
		if (node_type(node) != NodeTypes.NODE) {
			return;
		}
	}
	node = get_node_prop(context, node, path[len], options);
	if (node_type(node) == NodeTypes.DELETED_NODE) {
		return;
	} else {
		return node;
	}
}

/**
 * Give query or path, get value
 * @param {*} context 
 * @param {*} query_or_path 
 * @param {*} options 
 * @param {*} watcher 
 */
function get_path(context, path, options = {}) {
	const node = get_node_by_path(context, path, options);
	return node_type(node) == NodeTypes.NODE
		? get_all_node_props(context, node, options)
		: node;
}

function get_query(context, query, options = {}) {
	const node = get_node_by_path(context, context.key, options);
	return node_type(node) == NodeTypes.NODE
		? get_value_by_query(context, node, query, options)
		: undefined;
}

function on_watch_callback(context, path, cb) {
	const node = get_node_by_path(context, path, {});

	if (node_type(node) != NodeTypes.NODE) {
		throw new Error("Node not found at: " + path.join("."));
	}

	node._.on_watch_callback = cb;
}

module.exports = { get_query, get_path, on_watch_callback };
