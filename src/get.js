const { get_tag } = require("./util");

function handle_map_op(node, op, watcher, context) {
	let nodes = [];
	const props = Object.keys(node);
	const query = op._;

	for (let i = 0; i < props.length; i++) {
		const tag = get_tag(node[props[i]]);
		if (
			tag == "[object Deleted]" ||
			tag == "[object Null]" ||
			tag == "[object Undefined]"
		)
			continue;

		if (tag != "[object Object]" && tag != "[object Array]") {
			nodes.push(get_node_prop(node, props[i], watcher, context));
		} else {
			nodes.push(get_query(node[props[i]], query, watcher, context));
		}
	}
	if (typeof context.state.onMapCallback == "function") {
		nodes = context.state.onMapCallback(op, nodes) || nodes;
	}

	return nodes;
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

function get_all_node_props(node, watcher, context) {
	const result = {};
	const props = Object.keys(node);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		const tag = get_tag(node[prop]);

		if (
			tag != "[object Deleted]" &&
			tag != "[object Object]" &&
			tag != "[object Array]"
		) {
			result[prop] = get_node_prop(node, prop, watcher, context);
		}
	}
	return result;
}

function get_query(node, query, watcher, context) {
	const result = {};

	const props = Object.keys(query);
	if (query == 1 || props.length == 0) {
		return get_all_node_props(node, watcher, context);
	}

	for (let i = 0; i < props.length; i++) {
		const prop = props[i];

		const tag = get_tag(node[prop]);

		//Return value if  node[prop] is primitive
		if (tag == "[object Deleted]") continue;

		if (tag != "[object Object]" && tag != "[object Array]") {
			result[prop] = get_node_prop(node, prop, watcher, context);
		} else {
			const subQuery = query[prop];
			if (subQuery == 1) {
				result[prop] = get_all_node_props(node[prop], watcher, context);
			} else if (get_tag(subQuery) == "[object Object]") {
				if (subQuery._) {
					result[prop] = handle_map_op(
						node[prop],
						subQuery,
						watcher,
						context
					);
				} else {
					result[prop] = get_query(
						node[prop],
						subQuery,
						watcher,
						context
					);
				}
			} else {
				throw new Error(
					"Invalid query: " + JSON.stringify(subQuery, null, 2)
				);
			}
		}
	}
	return result;
}

module.exports = {
	get_query
};
