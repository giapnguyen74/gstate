const { to_path, value_type, ValueTypes, PatchTypes } = require("./util");
const create_tracker = require("./tracker");
const { calc_patches, calc_delete_patch } = require("./patch");
const { apply_patch, create_node } = require("./apply");
const { get_query, get_path, on_watch_callback } = require("./get");
let counter = Date.now() % 1e9;

class Context {
	constructor(state, key, debug) {
		this.state = state;
		this.key = key;
		debug = debug || state.debug;
		this.log = debug ? console.log : () => {};
		this._batch_tracker = undefined;
		this._batch_watcher = undefined;
	}

	/**
	 * Create new sub context
	 * @param {*} key 
	 * @param {*} [debug] 
	 */
	path(key, debug) {
		key = to_path(this.key, key);
		return new Context(this.state, key, debug);
	}

	ref(path) {
		path = to_path(this.key, path);
		return { _: "$ref", path };
	}
	/**
	 * Set value 
	 * @param {*} path 
	 * @param {*} value 
	 */
	set(path, value) {
		const _tracker = this._batch_tracker
			? this._batch_tracker
			: create_tracker();

		if (value_type(path) == ValueTypes.OBJECT) {
			value = path;
			path = this.key;
		} else {
			path = to_path(this.key, path);
		}

		const patches = calc_patches(this, path, value, _tracker);

		for (let i = 0; i < patches.length; i++) {
			apply_patch(this, patches[i], _tracker);
		}

		if (!this._batch_tracker) {
			_tracker.watchers.forEach(w => w());
		}
	}

	/**
	 * Delete value at path
	 * @param {*} path 
	 * @param {*} [tracker]
	 */
	delete(path) {
		path = to_path(this.key, path);
		const patch = calc_delete_patch(this, path);
		const _tracker = this._batch_tracker
			? this._batch_tracker
			: create_tracker();

		apply_patch(this, patch, _tracker);

		if (!this._batch_tracker) {
			_tracker.watchers.forEach(w => w());
		}
	}

	/**
	 * batch multiple set calls
	 * @param {*} fn 
	 */
	batch(fn) {
		this._batch_tracker = create_tracker();
		fn();
		this._batch_tracker.watchers.forEach(w => w());
		this._batch_tracker = undefined;
	}

	/**
	 * Query state 
	 * @param {*} query 
	 * @param {*} [options] 
	 * @param {*} [watcher] 
	 */
	get(query, options) {
		options = this._batch_watcher ? this._batch_watcher : options;

		if (value_type(query) == ValueTypes.OBJECT) {
			return get_query(this, query, options);
		} else {
			const path = to_path(this.key, query);
			return get_path(this, path, options);
		}
	}

	/**
	 * Watch state
	 * @param {*} query 
	 * @param {*} options 
	 * @param {*} [cb] 
	 */
	watch(query, options, cb) {
		if (!cb) {
			cb = options;
			options = {};
		}

		counter++;
		const w = counter;

		this.state.watchers[w] = () => {
			let result;
			options.watcher = w;
			if (typeof query == "function") {
				this._batch_watcher = options;
				result = query(this);
				this._batch_watcher = undefined;
			} else {
				result = this.get(query, options);
			}

			cb(result);
		};

		this.state.watchers[w]();

		return () => {
			delete this.state.watchers[w];
		};
	}

	onWatchCallback(path, cb) {
		path = to_path(this.key, path);
		return on_watch_callback(this, path, cb);
	}
}

class GState {
	constructor(options = {}) {
		this.rootNode = create_node();
		this.onMapCallback = options.onMapCallback;
		this.watchers = {};
		this.debug = options.debug;
		this.rootContext = new Context(this, [], options.debug);
	}

	ref(path) {
		return this.rootContext.ref(path);
	}
	path(key, debug) {
		return this.rootContext.path(key, debug);
	}

	set(path, value) {
		return this.rootContext.set(path, value);
	}

	batch(fn) {
		return this.rootContext.batch(fn);
	}

	get(query, watcher) {
		return this.rootContext.get(query, watcher);
	}

	delete(key) {
		return this.rootContext.delete(key);
	}

	watch(query, options, cb) {
		return this.rootContext.watch(query, options, cb);
	}

	onWatchCallback(path, cb) {
		return this.rootContext.onWatchCallback(path, cb);
	}

	save() {
		return calc_patches(
			this.rootContext,
			[],
			this.rootNode,
			create_tracker()
		);
	}

	load(patches) {
		const tracker = create_tracker();
		for (let i = 0; i < patches.length; i++) {
			apply_patch(this.rootContext, patches[i], tracker);
		}
	}

	use(plugin, options) {
		if (typeof plugin == "function") {
			plugin(this, options);
		} else {
			plugin.install(this, options);
		}
	}
}

module.exports = GState;
