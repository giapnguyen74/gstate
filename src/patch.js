const {
	value_type,
	ValueTypes,
	patch_type,
	PatchTypes,
	to_path
} = require("./util");

/**
 * 
 * @param {*} context 
 * @param {*} patches 
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function calc_patches_array(context, patches, path, value, tracker) {
	let ref = tracker.getRef(value);
	if (ref) {
		return patches.push([path, ref]);
	}
	tracker.setRef(value, [PatchTypes.REFERENCE, path]);
	patches.push([path, [PatchTypes.NODE, value.length]]);

	for (let i = 0; i < value.length; i++) {
		calc_patches_any(context, patches, path.concat([i]), value[i], tracker);
	}
}

/**
 * 
 * @param {*} context 
 * @param {*} patches 
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function calc_patches_object(context, patches, path, value, tracker) {
	let ref = tracker.getRef(value);
	if (ref) {
		return patches.push([path, ref]);
	}

	tracker.setRef(value, [PatchTypes.REFERENCE, path]);

	const props = Object.keys(value);
	if (props.length == 0) {
		return patches.push([path, [PatchTypes.NODE]]);
	}

	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		if (prop == "#") continue;
		calc_patches_any(
			context,
			patches,
			path.concat([prop]),
			value[prop],
			tracker
		);
	}
}

/**
 * Given path and value , calculate patches
 * @param {*} context 
 * @param {*} patches 
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function calc_patches_any(context, patches, path, value, tracker) {
	const valueType = value_type(value);
	if (valueType == ValueTypes.OBJECT) {
		if (value.propertyIsEnumerable("_")) {
			if (value["_"] == "$ref") {
				const refPath = to_path(context.key, value.path);
				return patches.push([path, [PatchTypes.REFERENCE, refPath]]);
			}
			throw new Error("Underscore property is reserved");
		}

		calc_patches_object(context, patches, path, value, tracker);
	} else if (valueType == ValueTypes.ARRAY) {
		calc_patches_array(context, patches, path, value, tracker);
	} else {
		patches.push([path, value]);
	}
}

/**
 * 
 * @param {*} context 
 * @param {*} path 
 * @param {*} value 
 * @param {*} tracker 
 */
function calc_patches(context, path, value, tracker) {
	const patches = [];
	if (value && value["#"]) {
		calc_patches_any(context, patches, [], value["#"], tracker);
	}
	calc_patches_any(context, patches, path, value, tracker);
	return patches;
}

function calc_delete_patch(context, path) {
	if (path.length == 0) throw new Error("You cannot delete root node");
	return [path, [PatchTypes.DEL]];
}

module.exports = {
	calc_patches,
	calc_delete_patch
};
