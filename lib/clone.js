"use strict";

var _require = require("./util"),
    get_tag = _require.get_tag;

var op = require("./op");

var CloneTags = {
	"[object Date]": function objectDate(val) {
		return val.toISOString();
	},
	"[object Number]": function objectNumber(val) {
		return val.valueOf();
	},
	"[object Boolean]": function objectBoolean(val) {
		return val.valueOf();
	},
	"[object Null]": function objectNull(val) {
		return val;
	},
	"[object Undefined]": function objectUndefined(val) {
		return val;
	},
	"[object String]": function objectString(val) {
		return val.toString();
	},
	"[object Ref]": function objectRef(val) {
		return val;
	}
};

/**
 * Clone any value
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function clone_any(path, value, tracker) {
	var tag = get_tag(value);
	var cloneFn = CloneTags[tag];
	if (cloneFn) {
		return cloneFn(value);
	}

	if (tag == "[object Object]") {
		return clone_obj(path, value, tracker);
	}

	if (tag == "[object Array]") {
		return clone_array(path, value, tracker);
	}

	throw new Error("Unsupport value type " + tag);
}

/**
 * Clone array value
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function clone_array(path, value, tracker) {
	var ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, op.$ref(path));

	var obj = [];
	for (var i = 0; i < value.length; i++) {
		obj.push(clone_any(path.concat(i), value[i], tracker));
	}
	return obj;
}

/**
 * Clone object value
 * @param {Object} value 
 */
function clone_obj(path, value, tracker) {
	var ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, op.$ref(path));

	var obj = {};

	var props = Object.keys(value);
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		if (prop == "#") continue;
		obj[prop] = clone_any(path.concat(prop), value[prop], tracker);
	}

	return obj;
}

module.exports = {
	clone_obj: clone_obj
};