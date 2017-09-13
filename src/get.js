const { is_primitive_value, is_object } = require("./util");

function get_all_primitive_prop(state, info) {
	const result = {};

	Object.keys(state).forEach(k => {
		if (is_primitive_value(state[k])) {
			result[k] = state[k];
			add_prop_watcher(state, k, info);
		}
	});
	return result;
}

function get_prop_array_item(item, query, info) {
	if (is_primitive_value(item)) {
		return item;
	} else if (Array.isArray(query)) {
		// query item as array
		return get_prop_array_value(item, query[0], info);
	} else if (is_object(query)) {
		//query item as object
		return get_object_query(item, query, info);
	} else if (query === undefined || query === 1) {
		// query all prop as long as value is primitive
		return get_all_primitive_prop(item, info);
	} else {
		throw new Error("Invalid query: " + query);
	}
}

function get_prop_array_value(state, query, info) {
	let result = [];
	if (is_object(state)) {
		result = Object.keys(state).map(k =>
			get_prop_array_item(state[k], query, info)
		);
	} else if (Array.isArray(state)) {
		result = state.map(item => get_prop_array_item(item, query, info));
	} else if (is_primitive_value(state)) {
		result = state;
	} else {
		throw new Error("Invalid state: " + state);
	}
	return result;
}

function add_prop_watcher(state, prop, info) {
	if (info.watcher) {
		state._[prop] = state._[prop] || new Set();
		state._[prop].add(info.watcher);
		if (info.debug) {
			console.log("Add watcher:", info.watcher, "for prop:", prop);
		}
	}
}

function get_object_query(state, query, info) {
	const result = {};
	const props = Object.keys(query);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		const queryProp = query[prop];
		const stateProp = state[prop];

		// if stateProp is primitive, copy stateProp to result ignore query.
		if (is_primitive_value(stateProp)) {
			result[prop] = stateProp;
		} else if (Array.isArray(queryProp)) {
			// query state as array
			result[prop] = get_prop_array_value(stateProp, queryProp[0], info);
		} else if (is_object(queryProp)) {
			// query state as object
			result[prop] = get_object_query(stateProp, queryProp, info);
		} else if (queryProp === 1) {
			// query all prop as long as value is primitive
			result[prop] = get_all_primitive_prop(stateProp, info);
		} else {
			throw new Error("Invalid query: " + queryProp);
		}
		add_prop_watcher(state, prop, info);
	}
	return result;
}

module.exports = {
	get_object_query
};
