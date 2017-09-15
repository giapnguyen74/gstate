let counter = Date.now() % 1e9;

function unique_id(prefix = "") {
	counter++;
	return prefix + counter + "." + ((Math.random() * 1e9) >>> 0);
}

function is_primitive_value(val) {
	return (
		val == null || (typeof val !== "function" && typeof val !== "object")
	);
}

function is_object(val) {
	return typeof val === "object" && val !== null && !Array.isArray(val);
}

function new_state() {
	const state = {};

	Object.defineProperty(state, "_", {
		value: {},
		writable: true
	});
	return state;
}

function is_state_object(state) {
	return (
		typeof state === "object" &&
		typeof state._ === "object" &&
		!Array.isArray(state)
	);
}

function to_path(paths) {
	if (Array.isArray(paths)) {
		return paths;
	} else if (typeof paths == "string") {
		return paths.split(".");
	} else {
		throw new Error("Paths should be array or string");
	}
}

module.exports = {
	is_primitive_value,
	is_state_object,
	is_object,
	unique_id,
	new_state,
	to_path
};
