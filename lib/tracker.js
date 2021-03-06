"use strict";

var WeakMap = require("./WeakMap");
var wm = new WeakMap();

var counter = Date.now() % 1e9;

function create_tracker() {
	counter++;
	var name = counter;
	return {
		watchers: new Set(),
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
module.exports = create_tracker;