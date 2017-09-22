const { get_tag, tags } = require("../src/util");

test("get_tag", function() {
	expect(get_tag(undefined)).toBe(tags.UNDEFINED);
	expect(get_tag(null)).toBe(tags.NULL);
	expect(get_tag({})).toBe(tags.OBJECT);
	expect(get_tag([])).toBe(tags.ARRAY);
});
