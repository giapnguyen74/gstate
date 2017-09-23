"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("./util"),
    get_tag = _require.get_tag,
    unique_id = _require.unique_id;

var _require2 = require("./clone"),
    clone_obj = _require2.clone_obj;

var _require3 = require("./merge"),
    merge_node = _require3.merge_node,
    create_node = _require3.create_node,
    delete_path = _require3.delete_path;

var _require4 = require("./tracker"),
    create_tracker = _require4.create_tracker;

var _require5 = require("./get"),
    get_query = _require5.get_query;

function to_path(key) {
	var _key = Array.isArray(key) ? key : key.split(".");
	if (_key.length < 1) {
		throw new Error("Invalid key " + key);
	}
	return _key;
}

function get_path(obj, key) {
	for (var i = 0; i < key.length; i++) {
		var prop = key[i];
		if (get_tag(obj[prop]) != "[object Object]") {
			return obj[prop];
		}
		obj = obj[prop];
	}
	return obj;
}

function set_path(obj, key, value) {
	if (key.length == 0) {
		return value;
	}
	var _obj = obj;
	for (var i = 0; i < key.length - 1; i++) {
		var prop = key[i];
		_obj[prop] = _obj[prop] || {};
		_obj = _obj[prop];
	}
	_obj[key[key.length - 1]] = value;
	return obj;
}

var Context = function () {
	function Context(state, key) {
		_classCallCheck(this, Context);

		this.key = key;
		this.state = state;
		this._rootNode = state._rootNode;
		this._watchers = state._watchers;
		this._readers = state._readers;

		this._batch_tracker = undefined;

		this.log = state.debug ? console.log : function () {
			return undefined;
		};
	}

	_createClass(Context, [{
		key: "path",
		value: function path(key) {
			key = to_path(key);
			return new Context(this.state, this.key.concat(key));
		}
	}, {
		key: "set",
		value: function set(value) {
			var _this = this;

			if (get_tag(value) != "[object Object]") {
				throw new Error("Value should be an object");
			}

			var tracker = this._batch_tracker ? this._batch_tracker : create_tracker();

			value = clone_obj(this.key, value, tracker);
			value = set_path({}, this.key, value);

			merge_node(this._rootNode, value, this);
			if (!this._batch_tracker) {
				Object.keys(this._watchers).forEach(function (k) {
					return _this._watchers[k].get();
				});
			}
		}
	}, {
		key: "batch",
		value: function batch(fn) {
			var _this2 = this;

			this._batch_tracker = create_tracker();
			fn(this);
			Object.keys(this._watchers).forEach(function (k) {
				return _this2._watchers[k].get();
			});
			this._batch_tracker = undefined;
		}
	}, {
		key: "get",
		value: function get(query, watcher) {
			var _this3 = this;

			query = set_path({}, this.key, query);
			var res = get_query(this._rootNode, null, query, watcher, this);

			setTimeout(function () {
				return Object.keys(_this3._readers).forEach(function (k) {
					return _this3._readers[k].notify();
				});
			});

			return get_path(res, this.key) || {};
		}
	}, {
		key: "delete",
		value: function _delete(key) {
			var _this4 = this;

			key = to_path(key);
			key = this.key.concat(key);
			delete_path(this._rootNode, key, this);
			if (!this._batch_tracker) {
				Object.keys(this._watchers).forEach(function (k) {
					return _this4._watchers[k].get();
				});
			}
		}
	}, {
		key: "watch",
		value: function watch(query, cb) {
			var _this5 = this;

			var w = unique_id();
			var result = undefined;

			this._watchers[w] = function () {
				result = undefined;
			};

			this._watchers[w].get = function () {
				if (result === undefined) {
					result = _this5.get(query, w);
					cb(result);
				}
			};

			this._watchers[w].get();

			return function () {
				delete _this5._watchers[w];
			};
		}
	}, {
		key: "reader",
		value: function reader(key, cb) {
			var _this6 = this;

			var r = unique_id();
			key = to_path(key);
			var node = get_path(this._rootNode, this.key.concat(key));
			if (!node || !node._) {
				throw new Error("Reader should be added into a existed node");
			}
			node._.readers.add(r);

			var props = [];

			this._readers[r] = function (node, prop) {
				props.push(prop);
			};

			this._readers[r].notify = function () {
				if (props.length > 0) {
					cb(node, props);
				}
				props = [];
			};

			return function () {
				delete _this6._readers[r];
			};
		}
	}]);

	return Context;
}();

var GState = function () {
	function GState() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, GState);

		this._rootNode = create_node();
		this._rootNode._.isRoot = true;
		this._watchers = {};
		this._readers = {};
		this.onMapCallback = options.onMapCallback;
		this.debug = options.debug;

		this.rootContext = new Context(this, []);
	}

	_createClass(GState, [{
		key: "path",
		value: function path(key) {
			return this.rootContext.path(key);
		}
	}, {
		key: "set",
		value: function set(value) {
			return this.rootContext.set(value);
		}
	}, {
		key: "get",
		value: function get(query, watcher) {
			return this.rootContext.get(query, watcher);
		}
	}, {
		key: "batch",
		value: function batch(fn) {
			return this.rootContext.batch(fn);
		}
	}, {
		key: "reader",
		value: function reader(key, cb) {
			return this.rootContext.reader(key, cb);
		}
	}, {
		key: "watch",
		value: function watch(query, cb) {
			return this.rootContext.watch(query, cb);
		}
	}, {
		key: "delete",
		value: function _delete(key) {
			return this.rootContext.delete(key);
		}
	}]);

	return GState;
}();

module.exports = GState;