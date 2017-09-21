const WeakMap = require("./WeakMap");
const wm = new WeakMap();
const { unique_id } = require("./util");

function create_tracker() {
	const name = unique_id();
	return {
		getRef(value) {
			const tracker_value = wm.get(value);
			if (tracker_value && tracker_value[0] == name) {
				return tracker_value[1];
			}
			return undefined;
		},
		setRef(value, ref) {
			wm.set(value, [name, ref]);
		}
	};
}

module.exports = {
	create_tracker
};
