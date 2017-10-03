function op_ref(path) {
	path = Array.isArray(path) ? path : path.split(".");
	return { _: "ref", path };
}

module.exports = {
	$ref: op_ref
};
