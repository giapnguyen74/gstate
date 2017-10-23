const {
	value_type,
	ValueTypes,
	patch_type,
	PatchTypes,
	to_path
} = require("./util");
const create_tracker = require("./tracker");

function encode_array(path, value, tracker) {
	let ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, { _: "$ref", path });
	const result = Array(value.length);
	for (let i = 0; i < value.length; i++) {
		result[i] = encode_any(path.concat(i), value[i], tracker);
	}
	return result;
}

function encode_object(path, value, tracker) {
	let ref = tracker.getRef(value);
	if (ref) {
		return ref;
	}
	tracker.setRef(value, { _: "$ref", path });
	const props = Object.keys(value);
	const result = {};
	for (let i = 0; i < props.length; i++) {
		const prop = props[i];
		result[prop] = encode_any(path.concat(prop), value[prop], tracker);
	}

	return result;
}

function encode_any(path, value, tracker) {
	const valueType = value_type(value);
	if (valueType == ValueTypes.OBJECT) {
		if (value._) {
			if (value._ == "$ref") {
				return value;
			} else {
				throw new Error("Underscore property is reserved.");
			}
		}
		return encode_object(path, value, tracker);
	} else if (valueType == ValueTypes.ARRAY) {
		return encode_array(path, value, tracker);
	} else {
		return value;
	}
}

class Persist {
	constructor(adapter, options = {}) {
		this.adapter = adapter(options);
	}

	insert(state, path, value) {
		path = to_path([], path);
		const encodeVal = encode_any(path, value, create_tracker());
		return this.adapter
			._insert(path, encodeVal)
			.then(() => state.set(path, encodeVal));
	}

	update(state, path, value) {
		path = to_path([], path);
		const encodeVal = encode_any(path, value, create_tracker());
		return this.adapter
			._update(path, encodeVal)
			.then(() => state.set(path, encodeVal));
	}

	remove(state, path) {
		path = to_path([], path);
		return this.adapter._remove(path).then(() => state.delete(path));
	}

	find(state, query) {
		return this.adapter._find(query).then(kvs => {
			state.batch(() => {
				for (let i = 0; i < kvs.length; i++) {
					const kv = kvs[i];
					state.set(kv[0], kv[1]);
				}
			});
		});
	}

	sync(state) {
		if (!this.adapter._sync) return;
		this.adapter._sync((op, path, value) => {
			if (op == "i" || op == "u") {
				state.set(path, value);
			}
			if (op == "d") {
				state.delete(path);
			}
		});
	}
}

module.exports = function persist(adapter, options) {
	return new Persist(adapter, options);
};
