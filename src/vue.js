const Database = require("./index");

module.exports = {
	install(Vue, options = {}) {
		const db = new Database();
		if (options.data) {
			db.put(options.data);
		}
		Vue.mixin({
			created() {
				this.$store = db;

				if (this.$options.nqlx) {
					this.$nqlx = {
						watchers: []
					};

					if (typeof this.$options.nqlx == "function") {
						const cfg = this.$options.nqlx(this);

						Object.keys(cfg).forEach(k => {
							const watchConfig = cfg[k];

							Vue.util.defineReactive(this, k, undefined);
							this.$nqlx.watchers.push(
								db.watch(watchConfig.query, val => {
									if (!watchConfig.cb) {
										this[k] = val[k];
									} else {
										this[k] = watchConfig.cb(val);
									}
								})
							);
						});
					} else {
						const cfg = this.$options.nqlx;
						Object.keys(cfg).forEach(k => {
							Vue.util.defineReactive(this, k, undefined);
						});
						this.$nqlx.watchers.push(
							db.watch(cfg, val => {
								Object.keys(cfg).forEach(
									k => (this[k] = val[k])
								);
							})
						);
					}
				}
			},
			beforeDestroy() {
				if (this.$nqlx) {
					this.$nqlx.watchers.forEach(u => u());
				}
			}
		});
	}
};
