const WeakMap = require("./WeakMap");
const wm = new WeakMap();

let counter = Date.now() % 1e9;

function create_tracker() {
	counter++;
	const name = counter;
	return {
		watchers: new Set(),
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
module.exports = create_tracker;
