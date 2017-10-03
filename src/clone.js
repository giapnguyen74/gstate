const { get_tag } = require("./util");
const op = require("./op");

const CloneTags = {
	"[object Date]": val => val.toISOString(),
	"[object Number]": val => val.valueOf(),
	"[object Boolean]": val => val.valueOf(),
	"[object Null]": val => val,
	"[object Undefined]": val => val,
	"[object String]": val => val.toString(),
	"[object Ref]": val => val
};

/**
 * Clone any value
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function clone_any(path, value, tracker) {
	const tag = get_tag(value);
	const cloneFn = CloneTags[tag];
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
	let ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, op.$ref(path));

	const obj = [];
	for (let i = 0; i < value.length; i++) {
		obj.push(clone_any(path.concat(i), value[i], tracker));
	}
	return obj;
}

/**
 * Clone object value
 * @param {Object} value 
 */
function clone_obj(path, value, tracker) {
	let ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, op.$ref(path));

	const obj = {};

	const props = Object.keys(value);
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		if (prop == "#") continue;
		obj[prop] = clone_any(path.concat(prop), value[prop], tracker);
	}

	return obj;
}

module.exports = {
	clone_obj
};
