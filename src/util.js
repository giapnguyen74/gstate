const toString = Object.prototype.toString;

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
	path = Array.isArray(path) ? path : path.split(".");
	if (path[0] == "#") {
		return path.slice(1);
	} else {
		return prefix.concat(path);
	}
}

const ValueTypes = {
	OBJECT: "[object Object]",
	ARRAY: "[object Array]",
	DATE: "[object Date]",
	NUMBER: "[object Number]",
	BOOLEAN: "[object Boolean]",
	NULL: "[object Null]",
	UNDEFINED: "[object Undefined]",
	STRING: "[object String]"
};

const NodeTypes = {
	NODE: 0,
	DELETED_NODE: -1,
	VALUE: 1
};

const PatchTypes = {
	REFERENCE: "$r",
	DEL: "$d",
	NODE: "$n"
};

module.exports = {
	value_type,
	ValueTypes,
	node_type,
	NodeTypes,
	PatchTypes,
	to_path
};
