"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WeakMap = require("./WeakMap");

var _require = require("./util"),
    is_object = _require.is_object,
    unique_id = _require.unique_id,
    new_state = _require.new_state;

var _require2 = require("./put"),
    put_object_value = _require2.put_object_value;

var _require3 = require("./get"),
    get_object_query = _require3.get_object_query;

var Database = function () {
	function Database() {
		_classCallCheck(this, Database);

		this.reset();
		this._tracker = new WeakMap();
	}

	_createClass(Database, [{
		key: "reset",
		value: function reset() {
			var _this = this;

			this._internal_data = new_state();
			if (this._watchers) {
				Object.keys(this._watchers).forEach(function (k) {
					delete _this._watchers[k];
				});
			}
			this._watchers = {};
		}
	}, {
		key: "put",
		value: function put(val) {
			var _this2 = this;

			var info = { tracker: unique_id(), db: this };
			if (!is_object(val)) {
				throw new Error("Value should be an pure object");
			}

			put_object_value(this._internal_data, val, info);
			Object.keys(this._watchers).forEach(function (k) {
				return _this2._watchers[k].get();
			});
		}
	}, {
		key: "get",
		value: function get(query, watcher) {
			var info = {
				watcher: watcher,
				debug: this.debug
			};

			if (!is_object(query)) {
				throw new Error("Query should be an object");
			}
			return get_object_query(this._internal_data, query, info);
		}
	}, {
		key: "watch",
		value: function watch(query, cb) {
			var _this3 = this;

			var w = unique_id();
			var result = undefined;

			this._watchers[w] = function () {
				result = undefined;
			};

			this._watchers[w].get = function () {
				if (result === undefined) {
					result = _this3.get(query, w);
					cb(result);
				}
			};

			this._watchers[w].get();

			return function () {
				delete _this3._watchers[w];
			};
		}
	}]);

	return Database;
}();

module.exports = Database;