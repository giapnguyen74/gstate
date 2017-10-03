const GState = require("../src/index");
test("ref#simple", function() {
	const state = new GState();
	state.set({ a: { d: "d" } });
	state.set({
		b: {
			c: state.op.$ref("a")
		}
	});

	const v = state.get("b.c.d");
	expect(v).toBe("d");
});

test("ref#not existed path", function() {
	const state = new GState();

	state.set({
		b: {
			c: state.op.$ref("a")
		}
	});

	let v = state.get("a");
	expect(v).toEqual({});
	state.set({ a: { d: "d" } });
	v = state.get("b.c.d");
	expect(v).toBe("d");
});

test("ref#path is value is override with object", function() {
	const state = new GState({ debug: true });
	state.set({ a: "w" });
	state.set({
		b: {
			c: state.op.$ref("a")
		}
	});

	let v = state.get("a");
	expect(v).toEqual({});
	state.set({ a: { d: "d" } });
	v = state.get("b.c.d");
	expect(v).toBe("d");
});
