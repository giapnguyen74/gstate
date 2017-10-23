"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var counter = Date.now() % 1e9;

var WeakMap = function () {
	function WeakMap() {
		_classCallCheck(this, WeakMap);

		counter++;
		this.name = "__wm-" + counter;
	}

	_createClass(WeakMap, [{
		key: "set",
		value: function set(key, value) {
			key.hasOwnProperty();
			if (!key.hasOwnProperty(this.name)) {
				Object.defineProperty(key, this.name, {
					value: value,
					writable: true
				});
			} else {
				key[this.name] = value;
			}
		}
	}, {
		key: "get",
		value: function get(key) {
			return key[this.name];
		}
	}, {
		key: "delete",
		value: function _delete(key) {
			delete key[this.name];
		}
	}, {
		key: "has",
		value: function has(key) {
			return key.hasOwnProperty(this.name);
		}
	}]);

	return WeakMap;
}();

module.exports = WeakMap;