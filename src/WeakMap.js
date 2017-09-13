class WeakMap {
	constructor() {
		this.name = "__wm-" + ((Math.random() * 1e9) >>> 0);
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
