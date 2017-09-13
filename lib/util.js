"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var counter = Date.now() % 1e9;

function unique_id() {
	var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

	counter++;
	return prefix + counter + "." + (Math.random() * 1e9 >>> 0);
}

function is_primitive_value(val) {
	return val == null || typeof val !== "function" && (typeof val === "undefined" ? "undefined" : _typeof(val)) !== "object";
}

function is_object(val) {
	return (typeof val === "undefined" ? "undefined" : _typeof(val)) === "object" && val !== null && !Array.isArray(val);
}

function new_state() {
	var state = {};

	Object.defineProperty(state, "_", {
		value: {},
		writable: true
	});
	return state;
}

module.exports = {
	is_primitive_value: is_primitive_value,
	is_object: is_object,
	unique_id: unique_id,
	new_state: new_state
};