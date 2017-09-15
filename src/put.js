const {
	is_primitive_value,
	is_state_object,
	is_object,
	new_state,
	to_path
} = require("./util");

function get_value_tracker(db, tracker_name, val) {
	const tracker_value = db._tracker.get(val);
	if (tracker_value && tracker_value[0] == tracker_name) {
		return tracker_value[1];
	}
	return undefined;
}

function set_value_tracker(db, tracker_name, val, state) {
	db._tracker.set(val, [tracker_name, state]);
}

function notify_state_prop_changed(db, state, prop, propVal) {
	state._[prop] = state._[prop] || new Set();
	const watchers = state._[prop];
	watchers.forEach(w => {
		if (typeof db._watchers[w] != "function") {
			watchers.delete(w);
		} else {
			if (db.debug) {
				console.log("Call watcher:", w, "for prop:", prop);
			}

			db._watchers[w](propVal, state[prop]);
		}
	});
}

function put_prop_value(state, prop, propVal, info) {
	if (state[prop] === propVal) return;

	state[prop] = propVal;

	notify_state_prop_changed(info.db, state, prop);
}

function convert_prop_array_value(propVal, info) {
	const result = [];
	for (let i = 0; i < propVal.length; i++) {
		const itemVal = propVal[i];
		if (Array.isArray(itemVal)) {
			const child = convert_prop_array_value(itemVal, info);
			result.push(child);
		} else if (is_primitive_value(itemVal)) {
			result.push(itemVal);
		} else if (is_object(itemVal)) {
			const child = put_object_value(null, itemVal, info);
			result.push(child);
		}
	}
	return result;
}

function put_object_paths(paths, info) {
	let state = info.root;
	paths = to_path(paths);
	for (let i = 0; i < paths.length; i++) {
		const prop = paths[i];
		if (is_state_object(state[prop])) {
			state = state[prop];
		} else {
			const s = new_state();
			put_prop_value(state, prop, s, info);
			state = s;
		}
	}
	return state;
}

function put_object_value(state, val, info) {
	//check val already tracked.
	const tracker_value = get_value_tracker(info.db, info.tracker, val);
	if (tracker_value) {
		return tracker_value;
	}

	if (val._) {
		return put_object_paths(val._, info);
	}

	if (!is_state_object(state)) {
		state = new_state();
	}

	//set tracker to bind state with val.
	set_value_tracker(info.db, info.tracker, val, state);

	//copy val property to state property
	const props = Object.keys(val);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		const propVal = val[prop];
		/*if (prop == "_") {
			throw new Error("Unfortunaly _ property name is reserved.");
		}*/

		if (Array.isArray(propVal)) {
			const arrVal = convert_prop_array_value(propVal, info);
			put_prop_value(state, prop, arrVal, info);
		} else if (is_primitive_value(propVal)) {
			put_prop_value(state, prop, propVal, info);
		} else if (is_object(propVal)) {
			const objVal = put_object_value(state[prop], propVal, info);
			put_prop_value(state, prop, objVal, info);
		}
	}

	return state;
}

module.exports = {
	put_object_value
};
