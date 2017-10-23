const GState = require("../src");

test("set#single", function() {
	const state = new GState();
	state.set({
		a: "a"
	});

	expect(state.rootNode).toEqual({ a: "a" });
});

test("set#deep", function() {
	const state = new GState();
	state.set({
		a: "a",
		b: {
			c: "c"
		}
	});

	expect(state.rootNode).toEqual({
		a: "a",
		b: {
			c: "c"
		}
	});
});

test("set#ref", function() {
	const state = new GState();
	const a = { b: "b" };
	state.set({
		a: a,
		b: a
	});

	expect(state.rootNode).toEqual({
		a: { b: "b" },
		b: { b: "b" }
	});

	expect(state.rootNode.a).toBe(state.rootNode.b);
});

test("set#circular_ref", function() {
	const state = new GState();
	const a = { b: "x" };
	a.a = a;
	state.set({
		a: a
	});

	expect(state.rootNode.a.b).toBe("x");
	expect(state.rootNode.a.a).toBe(state.rootNode.a);
});

test("set#array", function() {
	const state = new GState();
	const value = { a: [1, 2, 3] };
	state.set(value);
	expect(state.rootNode).toEqual({
		a: {
			0: 1,
			1: 2,
			2: 3
		}
	});
});

test("set#complex", function() {
	const state = new GState();
	const value = {
		a: {
			b: [{ x: 1 }, { y: { n: "b" } }]
		},
		d: true
	};
	state.set(value);
	expect(state.rootNode).toEqual({
		a: {
			b: { 0: { x: 1 }, 1: { y: { n: "b" } } }
		},
		d: true
	});
});

test("set#circular", function() {
	const state = new GState();
	const value = {
		a: {
			b: [{ x: 1 }, { y: { n: "b" } }]
		},
		d: true,
		b: {
			a: "a"
		}
	};
	value.b.x = value.b;
	state.set(value);

	expect(state.rootNode).toMatchObject({
		a: {
			b: { 0: { x: 1 }, 1: { y: { n: "b" } } }
		},
		d: true,
		b: {
			a: "a"
		}
	});
});

test("set#merge object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);

	value = {
		a: {
			c: "c"
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual({ a: { b: "b", c: "c" } });
});

test("set#merge object to primitive", function() {
	const state = new GState();
	let value = {
		a: "a"
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);

	value = {
		a: {
			c: "c"
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);
});

test("set#merge primitive to object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);

	value = {
		a: new Date("2019")
	};
	state.set(value);
	expect(state.rootNode).toEqual({ a: new Date("2019") });
});

test("set#deep merge object", function() {
	const state = new GState();
	let value = {
		a: {
			b: {
				c: {
					d: "d"
				}
			}
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);

	value = {
		a: {
			b: {
				c: {
					e: "e"
				},
				c2: {
					e: "e"
				}
			},
			d: true
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual({
		a: {
			b: {
				c: {
					e: "e",
					d: "d"
				},
				c2: {
					e: "e"
				}
			},
			d: true
		}
	});
});

test("set#merge object to array", function() {
	const state = new GState();
	let value = {
		a: [1, 2, 3]
	};
	state.set(value);
	expect(state.rootNode).toEqual({
		a: { 0: 1, 1: 2, 2: 3 }
	});
	value = {
		a: { "0": 1, "1": 2, "2": 3, b: "b" }
	};
	state.set(value);

	expect(state.rootNode).toEqual(value);
});

test("set#merge array to object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	state.set(value);
	expect(state.rootNode).toEqual(value);
	value = {
		a: [1, 2, 3]
	};
	state.set(value);
	expect(state.rootNode).toEqual({
		a: {
			0: 1,
			1: 2,
			2: 3
		}
	});
});

test("set#merge circular object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	value.b = value;
	state.set(value);

	value = {
		b: {
			c: "c"
		}
	};

	state.set(value);

	expect(state.rootNode.b).toBe(state.rootNode);
	expect(state.rootNode).toMatchObject({
		a: {
			b: "b"
		},
		c: "c"
	});
});

test("merge#deep ref", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		},
		c: {
			d: [
				{
					e: {
						f: true
					}
				}
			]
		}
	};

	value.b = value.c.d[0].e;
	state.set(value);
	expect(state.rootNode).toEqual({
		a: { b: "b" },
		b: { f: true },
		c: {
			d: {
				0: {
					e: { f: true }
				}
			}
		}
	});

	value = {
		c: [
			{
				d: {
					e: {
						f: false
					}
				}
			}
		]
	};
	value.b = value.c[0].d.e;
	state.set(value);

	expect(state.rootNode).toEqual({
		a: { b: "b" },
		c: {
			0: {
				d: {
					e: { f: false }
				}
			}
		},
		b: {
			f: false
		}
	});
});

test("merge#complex circular", function() {
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

	expect(state.rootNode.manager.name).toBe("Manager1");
	expect(state.rootNode.staffs.a.name).toBe("A");
	expect(state.rootNode.staffs.b.name).toBe("B");
	expect(state.rootNode.manager.staffs.a).toBe(state.rootNode.staffs.a);
	expect(state.rootNode.manager.staffs.b).toBe(state.rootNode.staffs.b);
	expect(state.rootNode.staffs.a.manager).toBe(state.rootNode.manager);
	expect(state.rootNode.staffs.b.manager).toBe(state.rootNode.manager);
});

test("set#single", function() {
	const state = new GState();
	state.set("b.c", {
		a: "a"
	});

	expect(state.rootNode).toEqual({ b: { c: { a: "a" } } });
});

test("set#deep", function() {
	const state = new GState();
	state.set(["n", "m"], {
		a: "a",
		b: {
			c: "c"
		}
	});

	expect(state.rootNode).toEqual({ n: { m: { a: "a", b: { c: "c" } } } });
});

test("set#ref", function() {
	const state = new GState();
	const a = { b: "b" };
	state.set("x.0", {
		a: a,
		b: a
	});

	expect(state.rootNode).toEqual({
		x: { "0": { a: { b: "b" }, b: { b: "b" } } }
	});

	expect(state.rootNode.a).toBe(state.rootNode.b);
});

test("set#circular_ref", function() {
	const state = new GState();
	const a = { b: "x" };
	a.a = a;
	state.set("u.u", {
		a: a
	});

	expect(state.rootNode.u.u.a.b).toBe("x");
	expect(state.rootNode.u.u.a.a).toBe(state.rootNode.u.u.a);
});

test("merge#complex circular", function() {
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
	state.set(["test"], value);

	expect(state.rootNode.test.manager.name).toBe("Manager1");
	expect(state.rootNode.test.staffs.a.name).toBe("A");
	expect(state.rootNode.test.staffs.b.name).toBe("B");
	expect(state.rootNode.test.manager.staffs.a).toBe(
		state.rootNode.test.staffs.a
	);
	expect(state.rootNode.test.manager.staffs.b).toBe(
		state.rootNode.test.staffs.b
	);
	expect(state.rootNode.test.staffs.a.manager).toBe(
		state.rootNode.test.manager
	);
	expect(state.rootNode.test.staffs.b.manager).toBe(
		state.rootNode.test.manager
	);
});

test("set#single value", function() {
	const state = new GState();
	state.set("b.c", 1);

	expect(state.rootNode).toEqual({ b: { c: 1 } });
});

test("set#merge empty object", function() {
	const state = new GState();
	state.set("b.c", { a: "a" });
	state.set("b.c", {});
	expect(state.rootNode).toEqual({ b: { c: { a: "a" } } });
});
