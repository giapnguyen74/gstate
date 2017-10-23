let counter = Date.now() % 1e9;
class WeakMap {
	constructor() {
		counter++;
		this.name = "__wm-" + counter;
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
