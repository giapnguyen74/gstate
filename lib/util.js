"use strict";

var toString = Object.prototype.toString;

function value_type(value) {
	return toString.call(value);
}

function node_type(value) {
	if (value && value._) {
		return value._.type || NodeTypes.NODE;
	}
	return NodeTypes.VALUE;
}

/**
 * 
 * @param {*} prefix 
 * @param {*} path 
 */
function to_path(prefix, path) {
	if (!path) return prefix;
	path = Array.isArray(path) ? path : path.split(".");
	if (path[0] == "#") {
		return path.slice(1);
	} else {
		return prefix.concat(path);
	}
}

var ValueTypes = {
	OBJECT: "[object Object]",
	ARRAY: "[object Array]",
	DATE: "[object Date]",
	NUMBER: "[object Number]",
	BOOLEAN: "[object Boolean]",
	NULL: "[object Null]",
	UNDEFINED: "[object Undefined]",
	STRING: "[object String]"
};

var NodeTypes = {
	NODE: 0,
	DELETED_NODE: -1,
	VALUE: 1
};

var PatchTypes = {
	REFERENCE: "$r",
	DEL: "$d",
	NODE: "$n"
};

module.exports = {
	value_type: value_type,
	ValueTypes: ValueTypes,
	node_type: node_type,
	NodeTypes: NodeTypes,
	PatchTypes: PatchTypes,
	to_path: to_path
};