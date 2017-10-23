const { calc_patches, calc_delete_patch } = require("../src/patch");
const create_tracker = require("../src/tracker");
const tracker = create_tracker();
const context = {};

test("calc_patches#simple", function() {
	const value = { a: "a" };

	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([[["a"], "a"]]);
});

test("calc_patches#deep", function() {
	const value = { a: "a", b: { c: "c" } };

	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([[["a"], "a"], [["b", "c"], "c"]]);
});

test("calc_patches#array", function() {
	const value = { a: [1, 2, 3] };
	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([
		[["a"], ["$n", 3]],
		[["a", 0], 1],
		[["a", 1], 2],
		[["a", 2], 3]
	]);
});

test("calc_patches#array with deep", function() {
	const value = { a: [{ a: 1 }, { a: 2 }, { a: 3 }] };
	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([
		[["a"], ["$n", 3]],
		[["a", 0, "a"], 1],
		[["a", 1, "a"], 2],
		[["a", 2, "a"], 3]
	]);
});

test("calc_patches#root prop", function() {
	const value = { a: "b", "#": { a: "b" } };
	const patches = calc_patches(context, ["c"], value, tracker);
	expect(patches).toEqual([[["a"], "b"], [["c", "a"], "b"]]);
});

test("calc_patches#empty object", function() {
	const value = {};
	const patches = calc_patches(context, ["a", "b"], value, tracker);
	expect(patches).toEqual([[["a", "b"], ["$n"]]]);
});

test("calc_patches#ref", function() {
	const a = { a: "a" };
	const value = {
		x: a,
		y: a
	};
	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([[["x", "a"], "a"], [["y"], ["$r", ["x"]]]]);
});

test("calc_patches#ref empty", function() {
	const a = {};
	const value = {
		x: a,
		y: a
	};
	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([[["x"], ["$n"]], [["y"], ["$r", ["x"]]]]);
});

test("calc_patches#circular ref", function() {
	const a = {
		a: "a"
	};
	const b = {
		b: "b"
	};
	a.c = b;
	b.c = a;
	const value = { a, b };
	const patches = calc_patches(context, [], value, tracker);
	expect(patches).toEqual([
		[["a", "a"], "a"],
		[["a", "c", "b"], "b"],
		[["a", "c", "c"], ["$r", ["a"]]],
		[["b"], ["$r", ["a", "c"]]]
	]);
});

test("calc_patches#circular to root", function() {
	const b = {
		b: "b"
	};
	const value = {
		a: b,

		"#": {
			b
		}
	};

	const patches = calc_patches(context, ["child"], value, tracker);
	expect(patches).toEqual([
		[["b", "b"], "b"],
		[["child", "a"], ["$r", ["b"]]]
	]);
});

test("calc_patches#circular_ref", function() {
	const a = { b: "b" };
	a.a = a;
	const patches = calc_patches(context, ["child"], a, tracker);
	expect(patches).toEqual([
		[["child", "b"], "b"],
		[["child", "a"], ["$r", ["child"]]]
	]);
});

test("calc_patches#array_ref", function() {
	const a = { b: [1, 2, 3] };
	const value = { a };
	value.b = a.b;
	const patches = calc_patches(context, ["child"], value, tracker);
	expect(patches).toEqual([
		[["child", "a", "b"], ["$n", 3]],
		[["child", "a", "b", 0], 1],
		[["child", "a", "b", 1], 2],
		[["child", "a", "b", 2], 3],
		[["child", "b"], ["$r", ["child", "a", "b"]]]
	]);
});

test("calc_delete_patch#single", function() {
	const patch = calc_delete_patch(context, ["a", "b"]);
	expect(patch).toEqual([["a", "b"], ["$d"]]);
});
