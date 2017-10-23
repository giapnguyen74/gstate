const GState = require("../src/index");
test("root#simple", function() {
	const rootState = new GState();
	const state = rootState.path("child");
	state.set({
		a: "a",
		"#": {
			x: "x"
		}
	});
	expect(rootState.get("x")).toBe("x");
	expect(
		state.get({
			a: 1,
			"#": {
				x: 1
			}
		})
	).toEqual({ "#": { x: "x" }, a: "a" });
});

test("root#complex", function() {
	const rootState = new GState({});
	const state = rootState.path("child");

	state.set({
		a: "a",
		"#": {
			child: {
				a: "c"
			}
		}
	});
	expect(rootState.get("child.a")).toBe("a");
	expect(
		state.get({
			a: 1,
			"#": {
				child: {
					a: 1
				}
			}
		})
	).toEqual({ "#": { child: { a: "a" } }, a: "a" });
});

test("root#anchor", function() {
	const rootState = new GState({});
	const state = rootState.path("child");

	const obj = {
		a: "a"
	};
	state.set({
		me: [obj],
		"#": {
			items: {
				a: obj
			}
		}
	});

	let v = state.get({
		me: {
			_: 1
		}
	});
	expect(v).toEqual({ me: [{ a: "a" }] });

	const obj2 = {
		a: "b"
	};

	state.set({
		"#": {
			items: {
				a: obj2
			}
		}
	});
	v = state.get({
		me: {
			_: 1
		}
	});
	expect(v).toEqual({ me: [{ a: "b" }] });
});

test("root#anchor with op ref", function() {
	const rootState = new GState({});
	const state = rootState.path("child");

	const obj = {
		a: "a"
	};

	state.set({
		me: [state.ref("#.items.a")],
		"#": {
			items: {
				a: obj
			}
		}
	});

	let v = state.get({
		me: {
			_: 1
		}
	});
	expect(v).toEqual({ me: [{ a: "a" }] });

	const obj2 = {
		a: "b"
	};

	state.set({
		"#": {
			items: {
				a: obj2
			}
		}
	});
	v = state.get({
		me: {
			_: 1
		}
	});
	expect(v).toEqual({ me: [{ a: "b" }] });
});
