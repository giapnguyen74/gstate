let counter = Date.now() % 1e9;

function unique_id() {
	counter++;
	return counter + "." + ((Math.random() * 1e9) >>> 0);
}

function get_tag(value) {
	const tag = Object.prototype.toString.call(value);

	if (tag == tags.OBJECT) {
		if (value._ && value._.deleted) {
			return tags.DELETED;
		}
		if (value._ == "ref") {
			return tags.REF;
		}
	}
	return tag;
}

const tags = {
	OBJECT: "[object Object]",
	ARRAY: "[object Array]",
	DELETED: "[object Deleted]",
	DATE: "[object Date]",
	NUMBER: "[object Number]",
	BOOLEAN: "[object Boolean]",
	NULL: "[object Null]",
	UNDEFINED: "[object Undefined]",
	STRING: "[object String]",
	REF: "[object Ref]"
};

module.exports = {
	unique_id,
	get_tag,
	tags
};
