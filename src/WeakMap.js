const { unique_id } = require("./util");

class WeakMap {
	constructor() {
		this.name = "__wm-" + unique_id();
	}

	set(key, value) {
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

	get(key) {
		return key[this.name];
	}

	delete(key) {
		delete key[this.name];
	}

	has(key) {
		return key.hasOwnProperty(this.name);
	}
}

module.exports = WeakMap;
