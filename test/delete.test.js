const GState = require("../src/index");

test("delete#simple", function() {
	const state = new GState();
	let counts = 0;
	state.set({
		a: {
			b: "b"
		}
	});
	state.watch(
		{
			a: 1
		},
		function(result) {
			counts++;
			counts == 1 && expect(result).toEqual({ a: { b: "b" } });
			counts == 2 && expect(result).toEqual({});
		}
	);
	state.delete("a");
	expect(counts).toBe(2);
});

test("delete#in map query and ref", function() {
	const state = new GState();
	let counts = 0;
	let val = {
		a: {
			item1: {
				name: "item1"
			},
			item2: {
				name: "item2"
			}
		}
	};
	val.b = val.a;
	state.set(val);

	state.watch(
		{
			a: {
				_: 1
			},
			b: {
				_: 1
			}
		},
		function(result) {
			counts++;
			counts == 1 &&
				expect(result).toEqual({
					a: [{ name: "item1" }, { name: "item2" }],
					b: [{ name: "item1" }, { name: "item2" }]
				});
			counts == 2 &&
				expect(result).toEqual({
					a: [{ name: "item2" }],
					b: [{ name: "item2" }]
				});
		}
	);
	state.delete("a.item1");

	expect(counts).toBe(2);
});

test("delete#single value", function() {
	const state = new GState();

	state.set({
		a: {
			b: "b"
		}
	});

	state.delete(["a", "b"]);
	const res = state.get({
		a: 1
	});

	expect(res).toEqual({ a: {} });
});

test("delete#no existed value", function() {
	const state = new GState();

	state.set({
		a: {
			b: "b"
		}
	});

	state.delete(["a", "b", 3, "x"]);
	const res = state.get({
		a: 1
	});

	expect(res).toEqual({ a: { b: "b" } });
});
