const { create_node } = require("../src/merge");
const GState = require("../src/index");

test("create_node", function() {
	let node = create_node();
	expect(node._).toEqual({
		watchers: {},
		readers: new Set()
	});
});

test("set#single", function() {
	const state = new GState();
	const value = { a: "a" };
	state.set(value);
	expect(state._rootNode).toEqual(value);
});

test("set#nested", function() {
	const state = new GState();
	const value = { a: "a", b: { b: "b" } };
	state.set(value);
	expect(state._rootNode).toEqual(value);
});

test("set#array", function() {
	const state = new GState();
	const value = { a: [1, 2, 3] };
	state.set(value);
	expect(state._rootNode).toEqual({
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
	expect(state._rootNode).toEqual({
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

	expect(state._rootNode).toMatchObject({
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
	expect(state._rootNode).toEqual(value);

	value = {
		a: {
			c: "c"
		}
	};
	state.set(value);
	expect(state._rootNode).toEqual({ a: { b: "b", c: "c" } });
});

test("set#merge object to primitive", function() {
	const state = new GState();
	let value = {
		a: "a"
	};
	state.set(value);
	expect(state._rootNode).toEqual(value);

	value = {
		a: {
			c: "c"
		}
	};
	state.set(value);
	expect(state._rootNode).toEqual(value);
});

test("set#merge primitive to object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	state.set(value);
	expect(state._rootNode).toEqual(value);

	value = {
		a: new Date("2019")
	};
	state.set(value);
	expect(state._rootNode).toEqual({ a: "2019-01-01T00:00:00.000Z" });
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
	expect(state._rootNode).toEqual(value);

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
	expect(state._rootNode).toEqual({
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
	expect(state._rootNode).toEqual({
		a: { 0: 1, 1: 2, 2: 3 }
	});
	value = {
		a: {
			b: "b"
		}
	};
	state.set(value);

	expect(state._rootNode).toEqual(value);
});

test("set#merge array to object", function() {
	const state = new GState();
	let value = {
		a: {
			b: "b"
		}
	};
	state.set(value);
	expect(state._rootNode).toEqual(value);
	value = {
		a: [1, 2, 3]
	};
	state.set(value);
	expect(state._rootNode).toEqual({
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

	expect(state._rootNode.b).toBe(state._rootNode);
	expect(state._rootNode).toMatchObject({
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
	expect(state._rootNode).toEqual({
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

	expect(state._rootNode).toEqual({
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
