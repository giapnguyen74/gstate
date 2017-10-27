"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("./util"),
    to_path = _require.to_path,
    value_type = _require.value_type,
    ValueTypes = _require.ValueTypes,
    PatchTypes = _require.PatchTypes;

var create_tracker = require("./tracker");

var _require2 = require("./patch"),
    calc_patches = _require2.calc_patches,
    calc_delete_patch = _require2.calc_delete_patch;

var _require3 = require("./apply"),
    apply_patch = _require3.apply_patch,
    create_node = _require3.create_node;

var _require4 = require("./get"),
    get_query = _require4.get_query,
    get_path = _require4.get_path,
    on_watch_callback = _require4.on_watch_callback;

var counter = Date.now() % 1e9;

var Context = function () {
	function Context(state, key, debug) {
		_classCallCheck(this, Context);

		this.state = state;
		this.key = key;
		debug = debug || state.debug;
		this.log = debug ? console.log : function () {};
		this._batch_tracker = undefined;
		this._batch_watcher = undefined;
	}

	/**
  * Create new sub context
  * @param {*} key 
  * @param {*} [debug] 
  */


	_createClass(Context, [{
		key: "path",
		value: function path(key, debug) {
			key = to_path(this.key, key);
			return new Context(this.state, key, debug);
		}
	}, {
		key: "ref",
		value: function ref(path) {
			path = to_path(this.key, path);
			return { _: "$ref", path: path };
		}
		/**
   * Set value 
   * @param {*} path 
   * @param {*} value 
   */

	}, {
		key: "set",
		value: function set(path, value) {
			var _tracker = this._batch_tracker ? this._batch_tracker : create_tracker();

			if (value_type(path) == ValueTypes.OBJECT) {
				value = path;
				path = this.key;
			} else {
				path = to_path(this.key, path);
			}

			var patches = calc_patches(this, path, value, _tracker);

			for (var i = 0; i < patches.length; i++) {
				apply_patch(this, patches[i], _tracker);
			}

			if (!this._batch_tracker) {
				_tracker.watchers.forEach(function (w) {
					return w();
				});
			}
		}

		/**
   * Delete value at path
   * @param {*} path 
   * @param {*} [tracker]
   */

	}, {
		key: "delete",
		value: function _delete(path) {
			path = to_path(this.key, path);
			var patch = calc_delete_patch(this, path);
			var _tracker = this._batch_tracker ? this._batch_tracker : create_tracker();

			apply_patch(this, patch, _tracker);

			if (!this._batch_tracker) {
				_tracker.watchers.forEach(function (w) {
					return w();
				});
			}
		}

		/**
   * batch multiple set calls
   * @param {*} fn 
   */

	}, {
		key: "batch",
		value: function batch(fn) {
			this._batch_tracker = create_tracker();
			fn();
			this._batch_tracker.watchers.forEach(function (w) {
				return w();
			});
			this._batch_tracker = undefined;
		}

		/**
   * Query state 
   * @param {*} query 
   * @param {*} [options] 
   * @param {*} [watcher] 
   */

	}, {
		key: "get",
		value: function get(query, options) {
			options = this._batch_watcher ? this._batch_watcher : options;

			if (value_type(query) == ValueTypes.OBJECT) {
				return get_query(this, query, options);
			} else {
				var path = to_path(this.key, query);
				return get_path(this, path, options);
			}
		}

		/**
   * Watch state
   * @param {*} query 
   * @param {*} options 
   * @param {*} [cb] 
   */

	}, {
		key: "watch",
		value: function watch(query, options, cb) {
			var _this = this;

			if (!cb) {
				cb = options;
				options = {};
			}

			counter++;
			var w = counter;

			this.state.watchers[w] = function () {
				var result = void 0;
				options.watcher = w;
				if (typeof query == "function") {
					_this._batch_watcher = options;
					result = query(_this);
					_this._batch_watcher = undefined;
				} else {
					result = _this.get(query, options);
				}

				cb(result);
			};

			this.state.watchers[w]();

			return function () {
				delete _this.state.watchers[w];
			};
		}
	}, {
		key: "onWatchCallback",
		value: function onWatchCallback(path, cb) {
			path = to_path(this.key, path);
			return on_watch_callback(this, path, cb);
		}
	}]);

	return Context;
}();

var GState = function () {
	function GState() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, GState);

		this.rootNode = create_node();
		this.onMapCallback = options.onMapCallback;
		this.watchers = {};
		this.debug = options.debug;
		this.rootContext = new Context(this, [], options.debug);
	}

	_createClass(GState, [{
		key: "ref",
		value: function ref(path) {
			return this.rootContext.ref(path);
		}
	}, {
		key: "path",
		value: function path(key, debug) {
			return this.rootContext.path(key, debug);
		}
	}, {
		key: "set",
		value: function set(path, value) {
			return this.rootContext.set(path, value);
		}
	}, {
		key: "batch",
		value: function batch(fn) {
			return this.rootContext.batch(fn);
		}
	}, {
		key: "get",
		value: function get(query, watcher) {
			return this.rootContext.get(query, watcher);
		}
	}, {
		key: "delete",
		value: function _delete(key) {
			return this.rootContext.delete(key);
		}
	}, {
		key: "watch",
		value: function watch(query, options, cb) {
			return this.rootContext.watch(query, options, cb);
		}
	}, {
		key: "onWatchCallback",
		value: function onWatchCallback(path, cb) {
			return this.rootContext.onWatchCallback(path, cb);
		}
	}, {
		key: "save",
		value: function save() {
			return calc_patches(this.rootContext, [], this.rootNode, create_tracker());
		}
	}, {
		key: "load",
		value: function load(patches) {
			var tracker = create_tracker();
			for (var i = 0; i < patches.length; i++) {
				apply_patch(this.rootContext, patches[i], tracker);
			}
		}
	}, {
		key: "use",
		value: function use(plugin, options) {
			if (typeof plugin == "function") {
				plugin(this, options);
			} else {
				plugin.install(this, options);
			}
		}
	}]);

	return GState;
}();

module.exports = GState;