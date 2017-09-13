"use strict";

var Database = require("./index");

module.exports = {
	install: function install(Vue) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var db = new Database();
		if (options.data) {
			db.put(options.data);
		}
		Vue.mixin({
			created: function created() {
				var _this = this;

				this.$store = db;

				if (this.$options.nqlx) {
					this.$nqlx = {
						watchers: []
					};

					if (typeof this.$options.nqlx == "function") {
						var cfg = this.$options.nqlx(this);

						Object.keys(cfg).forEach(function (k) {
							var watchConfig = cfg[k];

							Vue.util.defineReactive(_this, k, undefined);
							_this.$nqlx.watchers.push(db.watch(watchConfig.query, function (val) {
								if (!watchConfig.cb) {
									_this[k] = val[k];
								} else {
									_this[k] = watchConfig.cb(val);
								}
							}));
						});
					} else {
						var _cfg = this.$options.nqlx;
						Object.keys(_cfg).forEach(function (k) {
							Vue.util.defineReactive(_this, k, undefined);
						});
						this.$nqlx.watchers.push(db.watch(_cfg, function (val) {
							Object.keys(_cfg).forEach(function (k) {
								return _this[k] = val[k];
							});
						}));
					}
				}
			},
			beforeDestroy: function beforeDestroy() {
				if (this.$nqlx) {
					this.$nqlx.watchers.forEach(function (u) {
						return u();
					});
				}
			}
		});
	}
};