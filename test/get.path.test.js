const GState = require("../src/index");
test("get#simple", function() {
	const state = new GState();
	const value = { a: "a" };
	state.set(value);
	const res = state.get("a");

	expect(res).toEqual(value.a);
});

test("get#simple array", function() {
	const state = new GState();
	const value = { a: [1, 2, 3] };
	state.set(value);
	const res = state.get(["a", 1]);

	expect(res).toBe(2);
});

test("get#query nested object", function() {
	const state = new GState();
	const value = {
		a: {
			b: {
				c: "c",
				d: "d"
			}
		}
	};
	state.set(value);
	const res = state.get("a.b.c");

	expect(res).toBe("c");
});

test("get#map op", function() {
	const state = new GState();
	const value = {
		a: {
			b: {
				c: "c",
				d: "d"
			}
		}
	};
	state.set(value);
	const res = state.get("a.b._");

	expect(res).toEqual(["c", "d"]);
});
