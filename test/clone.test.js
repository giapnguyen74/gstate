const { create_tracker } = require("../src/tracker.js");
const tracker = create_tracker();
const { clone_obj } = require("../src/clone");

test("clone#simple", function() {
	const value = { a: "a" };
	const obj = clone_obj([], value, tracker);
	expect(obj).toEqual(value);
	expect(obj).not.toBe(value);
});

test("clone#primitive values", function() {
	const value = {
		boolean: true,
		date: new Date("2019"),
		number: 4.5,
		string: "abc",
		$null: null,
		$undefined: undefined
	};
	const obj = clone_obj([], value, tracker);
	value.date = "2019-01-01T00:00:00.000Z";
	expect(obj).toEqual(value);
	expect(obj).not.toBe(value);
});

test("clone#object and array", function() {
	const value = {
		obj: {
			a: "a",
			b: "b"
		},
		arr: [1, 2, 3],
		arrInObj: {
			a: "a",
			b: [1, 2, 3]
		},
		objInArr: [{ a: "a" }, { b: "b" }, { c: "c" }]
	};
	const obj = clone_obj([], value, tracker);
	expect(obj).toEqual(value);
	expect(obj).not.toBe(value);
});

test("clone#object circular reference", function() {
	const value = {
		a: {
			a: "a"
		}
	};
	value.b = value.a;
	const obj = clone_obj([], value, tracker);
	expect(obj).not.toBe(value);
	expect(obj).toEqual({ a: { a: "a" }, b: { _: "ref", path: ["a"] } });
});

test("clone#complex object circular reference", function() {
	const value = {
		a: {
			a: "a"
		},
		c: [1, 2, 3]
	};
	value.b = value; //circular to root
	value.d = value.c; //reference to array
	value.c[3] = value; //circular array item to root

	const obj = clone_obj([], value, tracker);
	expect(obj).not.toBe(value);
	expect(obj).toEqual({
		a: { a: "a" },
		b: { _: "ref", path: [] },
		c: [1, 2, 3, { _: "ref", path: [] }],
		d: { _: "ref", path: ["c"] }
	});
});

test("clone#unclonable", function() {
	let value = {
		a: new Error("ttt")
	};
	expect(() => clone_obj([], value, tracker)).toThrow(
		"Unsupport value type [object Error]"
	);

	value = {
		a: function() {}
	};
	expect(() => clone_obj([], value, tracker)).toThrow(
		"Unsupport value type [object Function]"
	);
});
