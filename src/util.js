let counter = Date.now() % 1e9;

function unique_id() {
	counter++;
	return counter + "." + ((Math.random() * 1e9) >>> 0);
}

function get_tag(value) {
	const tag = Object.prototype.toString.call(value);

	if (tag == "[object Object]") {
		if (value._ && value._.deleted) {
			return "[object Deleted]";
		}
	}
	return tag;
}

module.exports = {
	unique_id,
	get_tag
};
