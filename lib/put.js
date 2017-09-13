"use strict";

var _require = require("./util"),
    is_primitive_value = _require.is_primitive_value,
    is_object = _require.is_object,
    new_state = _require.new_state;

function get_value_tracker(db, tracker_name, val) {
	var tracker_value = db._tracker.get(val);
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
	var watchers = state._[prop];
	watchers.forEach(function (w) {
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
	var result = [];
	for (var i = 0; i < propVal.length; i++) {
		var itemVal = propVal[i];
		if (Array.isArray(itemVal)) {
			var child = convert_prop_array_value(itemVal, info);
			result.push(child);
		} else if (is_primitive_value(itemVal)) {
			result.push(itemVal);
		} else if (is_object(itemVal)) {
			var _child = put_object_value(null, itemVal, info);
			result.push(_child);
		}
	}
	return result;
}

function put_object_value(state, val, info) {
	//check val already tracked.
	var tracker_value = get_value_tracker(info.db, info.tracker, val);
	if (tracker_value) {
		return tracker_value;
	}

	if (!is_object(state) || !state._) {
		state = new_state();
	}

	//set tracker to bind state with val.
	set_value_tracker(info.db, info.tracker, val, state);

	//copy val property to state property
	var props = Object.keys(val);
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		var propVal = val[prop];
		if (prop == "_") {
			throw new Error("Unfortunaly _ property name is reserved.");
		}

		if (Array.isArray(propVal)) {
			var arrVal = convert_prop_array_value(propVal, info);
			put_prop_value(state, prop, arrVal, info);
		} else if (is_primitive_value(propVal)) {
			put_prop_value(state, prop, propVal, info);
		} else if (is_object(propVal)) {
			var objVal = put_object_value(state[prop], propVal, info);
			put_prop_value(state, prop, objVal, info);
		}
	}

	return state;
}

module.exports = {
	put_object_value: put_object_value
};