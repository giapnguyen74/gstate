const GState = require("../src/index");
test("get#simple", function() {
	const state = new GState();
	const value = { a: "a" };
	state.set(value);
	const res = state.get({
		a: 1
	});

	expect(res).toEqual(value);
});

test("get#simple array", function() {
	const state = new GState();
	const value = { a: [1, 2, 3] };
	state.set(value);
	const res = state.get({
		a: 1
	});

	expect(res).toEqual({ a: { "0": 1, "1": 2, "2": 3 } });
});

test("get#cannot implicit query nested object", function() {
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
	const res = state.get({
		a: 1
	});

	expect(res).toEqual({ a: {} });
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
	const res = state.get({
		a: {
			b: {
				c: 1
			}
		}
	});

	expect(res).toEqual({ a: { b: { c: "c" } } });
});

test("get#invalid query", function() {
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

	expect(() => {
		const res = state.get({
			a: 2
		});
	}).toThrow("Invalid query: 2");
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
	const res = state.get({
		a: {
			b: {
				_: 1
			}
		}
	});

	expect(res).toEqual({ a: { b: ["c", "d"] } });
});

test("get#map op for array", function() {
	const state = new GState();
	const value = {
		a: {
			b: [1, 2]
		}
	};
	state.set(value);
	const res = state.get({
		a: {
			b: {
				_: 1
			}
		}
	});

	expect(res).toEqual({ a: { b: [1, 2] } });
});

test("get#map op for nested object", function() {
	const state = new GState();
	const value = {
		a: {
			b: {
				c: {
					x: "c"
				},
				d: {
					x: "d"
				}
			}
		}
	};
	state.set(value);
	const res = state.get({
		a: {
			b: {
				_: {
					x: 1
				}
			}
		}
	});

	expect(res).toEqual({ a: { b: [{ x: "c" }, { x: "d" }] } });
});

test("get#empty query", function() {
	const state = new GState();
	state.set({
		a: {
			a: 1,
			b: 2,
			c: {
				d: "d"
			}
		}
	});

	const res = state.get({
		a: {}
	});
	expect(res).toEqual({
		a: {
			a: 1,
			b: 2
		}
	});
});

test("get#complex circular", function() {
	const state = new GState();

	let value = {
		manager: {
			name: "Manager1"
		},
		staffs: {
			a: {
				name: "A"
			},
			b: {
				name: "B"
			}
		}
	};

	value.manager.staffs = value.staffs;
	value.staffs.a.manager = value.manager;
	value.staffs.b.manager = value.manager;
	state.set(value);
	const res = state.get({
		manager: {
			name: 1,
			staffs: {
				_: {
					name: 1
				}
			}
		},
		staffs: {
			_: {
				name: 1,
				manager: {
					name: 1
				}
			}
		}
	});
	expect(res).toEqual({
		manager: {
			name: "Manager1",
			staffs: [
				{
					name: "A"
				},
				{
					name: "B"
				}
			]
		},
		staffs: [
			{
				name: "A",
				manager: {
					name: "Manager1"
				}
			},
			{
				name: "B",
				manager: {
					name: "Manager1"
				}
			}
		]
	});
});
