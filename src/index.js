const WeakMap = require("./WeakMap");
const { is_object, unique_id, new_state } = require("./util");
const { put_object_value } = require("./put");
const { get_object_query } = require("./get");

function path(state, paths) {
	for (let i = 0; i < paths.length; i++) {
		state;
	}
}

class Database {
	constructor() {
		this.reset();
		this._tracker = new WeakMap();
	}

	path(paths) {
		if (typeof paths == "string") {
			paths = paths.split(".");
		}
	}

	reset() {
		this._internal_data = new_state();
		if (this._watchers) {
			Object.keys(this._watchers).forEach(k => {
				delete this._watchers[k];
			});
		}
		this._watchers = {};
	}

	put(val) {
		const info = {
			tracker: unique_id(),
			db: this,
			root: this._internal_data
		};
		if (!is_object(val)) {
			throw new Error("Value should be an pure object");
		}

		put_object_value(this._internal_data, val, info);
		Object.keys(this._watchers).forEach(k => this._watchers[k].get());
	}

	get(query, watcher) {
		const info = {
			watcher,
			debug: this.debug
		};

		if (!is_object(query)) {
			throw new Error("Query should be an object");
		}
		return get_object_query(this._internal_data, query, info);
	}

	watch(query, cb) {
		const w = unique_id();
		let result = undefined;

		this._watchers[w] = () => {
			result = undefined;
		};

		this._watchers[w].get = () => {
			if (result === undefined) {
				result = this.get(query, w);
				cb(result);
			}
		};

		this._watchers[w].get();

		return () => {
			delete this._watchers[w];
		};
	}
}

module.exports = Database;
