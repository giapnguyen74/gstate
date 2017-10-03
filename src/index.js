const { get_tag, unique_id, tags } = require("./util");
const { clone_obj } = require("./clone");
const { merge_node, create_node, delete_path } = require("./merge");
const { create_tracker } = require("./tracker");
const { get_query } = require("./get");
const op = require("./op");

function to_path(key) {
	const _key = Array.isArray(key) ? key : key.split(".");
	if (_key.length < 1) {
		throw new Error("Invalid key " + key);
	}
	return _key;
}

function get_path(obj, key) {
	for (let i = 0; i < key.length; i++) {
		const prop = key[i];
		if (get_tag(obj[prop]) != "[object Object]") {
			return obj[prop];
		}
		obj = obj[prop];
	}
	return obj;
}

function set_path(obj, key, value) {
	if (key.length == 0) {
		return Object.assign(obj, value); //value has high priority
	}
	let _obj = obj;
	for (let i = 0; i < key.length - 1; i++) {
		const prop = key[i];
		_obj[prop] = _obj[prop] || {};
		_obj = _obj[prop];
	}
	_obj[key[key.length - 1]] = value;
	return obj;
}

class Context {
	constructor(state, key) {
		this.key = key;
		this.state = state;
		this._rootNode = state._rootNode;
		this._watchers = state._watchers;
		this._readers = state._readers;

		this._batch_tracker = undefined;

		this.log = state.debug ? console.log : () => undefined;
		this.op = op;
	}

	path(key) {
		key = to_path(key);
		return new Context(this.state, this.key.concat(key));
	}

	set(value) {
		if (get_tag(value) != tags.OBJECT) {
			throw new Error("Value should be an object");
		}

		const tracker = this._batch_tracker
			? this._batch_tracker
			: create_tracker();

		//support root value
		const rootVal = value["#"];
		let rootObj = {};
		if (rootVal) {
			if (get_tag(rootVal) != tags.OBJECT) {
				throw new Error("Root value should be an object");
			}
			rootObj = clone_obj([], rootVal, tracker);
		}

		value = clone_obj(this.key, value, tracker);
		value = set_path(rootObj, this.key, value);

		merge_node(this._rootNode, value, this);
		if (!this._batch_tracker) {
			Object.keys(this._watchers).forEach(k => this._watchers[k].get());
		}
	}

	batch(fn) {
		this._batch_tracker = create_tracker();
		fn(this);
		Object.keys(this._watchers).forEach(k => this._watchers[k].get());
		this._batch_tracker = undefined;
	}

	get(query, watcher) {
		let path = this.key;

		// query is a path
		const queryTag = get_tag(query);
		if (queryTag == tags.STRING || queryTag == tags.ARRAY) {
			path = path.concat(to_path(query));
			query = set_path({}, path, 1);
		} else if (query == tags.OBJECT) {
			query = set_path({}, path, query);
		} else {
			throw new Error("Query should be string, array or object.");
		}

		let res = get_query(this._rootNode, null, query, watcher, this);

		setTimeout(() =>
			Object.keys(this._readers).forEach(k => this._readers[k].notify())
		);

		return get_path(res, path);
	}

	delete(key) {
		key = to_path(key);
		key = this.key.concat(key);
		delete_path(this._rootNode, key, this);
		if (!this._batch_tracker) {
			Object.keys(this._watchers).forEach(k => this._watchers[k].get());
		}
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

	reader(key, cb) {
		const r = unique_id();
		key = to_path(key);
		const node = get_path(this._rootNode, this.key.concat(key));
		if (!node || !node._) {
			throw new Error("Reader should be added into a existed node");
		}
		node._.readers.add(r);

		let props = [];

		this._readers[r] = (node, prop) => {
			props.push(prop);
		};

		this._readers[r].notify = () => {
			if (props.length > 0) {
				cb(node, props);
			}
			props = [];
		};

		return () => {
			delete this._readers[r];
		};
	}
}

class GState {
	constructor(options = {}) {
		this._rootNode = create_node();
		this._rootNode._.isRoot = true;
		this._watchers = {};
		this._readers = {};
		this.onMapCallback = options.onMapCallback;
		this.debug = options.debug;
		this.op = op;
		this.rootContext = new Context(this, []);
	}

	path(key) {
		return this.rootContext.path(key);
	}

	set(value) {
		return this.rootContext.set(value);
	}

	get(query, watcher) {
		return this.rootContext.get(query, watcher);
	}

	batch(fn) {
		return this.rootContext.batch(fn);
	}

	reader(key, cb) {
		return this.rootContext.reader(key, cb);
	}

	watch(query, cb) {
		return this.rootContext.watch(query, cb);
	}

	delete(key) {
		return this.rootContext.delete(key);
	}
}

module.exports = GState;
