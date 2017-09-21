"use strict";

var WeakMap = require("./WeakMap");
var wm = new WeakMap();

var _require = require("./util"),
    unique_id = _require.unique_id;

function create_tracker() {
	var name = unique_id();
	return {
		getRef: function getRef(value) {
			var tracker_value = wm.get(value);
			if (tracker_value && tracker_value[0] == name) {
				return tracker_value[1];
			}
			return undefined;
		},
		setRef: function setRef(value, ref) {
			wm.set(value, [name, ref]);
		}
	};
}

module.exports = {
	create_tracker: create_tracker
};