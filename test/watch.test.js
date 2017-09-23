const GState = require("../src/index");
test("watch#single", function() {
	const state = new GState();
	let calls = 0;
	let value = { a: "a" };
	state.set(value);
	state.watch(
		{
			a: 1
		},
		result => {
			calls++;
			expect(result).toEqual(value);
		}
	);

	value = { a: "b" };
	state.set(value);

	expect(calls).toBe(2);
});

test("watch#map primitive", function() {
	const state = new GState();
	let calls = 0;
	let value = {
		a: {
			a1: "a1"
		}
	};
	state.set(value);

	state.watch(
		{
			a: {
				_: 1
			}
		},
		result => {
			calls++;
			calls == 1 &&
				expect(result).toEqual({
					a: ["a1"]
				});
			calls == 2 &&
				expect(result).toEqual({
					a: ["a1", "a2"]
				});
		}
	);
	value = {
		a: {
			a2: "a2"
		}
	};
	state.set(value);
});

test("watch#nested", function() {
	const state = new GState();
	let calls = 0;
	let value = { a: "a" };
	state.set(value);
	state.watch(
		{
			a: {
				b: {
					c: 1
				}
			}
		},
		result => {
			calls++;
			expect(result).toEqual(value);
		}
	);

	value = { a: "b" };
	state.set(value);

	value = { a: { b: "b" } };
	state.set(value);

	value = { a: { b: { c: "c" } } };
	state.set(value);

	//not reactive
	value = { a: { b: { e: "e" } } };
	state.set(value);

	value = { x: "x" };
	state.set(value);

	expect(calls).toBe(4);
});

test("watch#circular", function() {
	const state = new GState();
	let calls = 0;
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
	state.watch(
		{
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
		},
		result => {
			calls++;
			calls == 1 &&
				expect(result).toEqual({
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

			calls == 2 &&
				expect(result).toEqual({
					manager: {
						name: "Manager2",
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
								name: "Manager2"
							}
						},
						{
							name: "B",
							manager: {
								name: "Manager2"
							}
						}
					]
				});
		}
	);

	value = {
		manager: { name: "Manager2" }
	};
	state.set(value);

	expect(calls).toBe(2);
});

test("watch#unwatch", function() {
	const state = new GState();
	let calls = 0;
	let value = {
		a: "a"
	};
	state.set(value);
	const handler = state.watch(
		{
			a: 1
		},
		result => {
			calls++;
			expect(result).toEqual(value);
		}
	);

	handler();
	state.set({ a: "b" });
	state.set({ a: "c" });

	expect(calls).toBe(1);
});

test("watch#chain of watches", function() {
	const state = new GState();
	let calls = 0;
	let value;
	state.watch(
		{
			a: {
				b: {
					c: {
						d: 1
					}
				}
			}
		},
		result => {
			calls++;
			calls == 1 && expect(result).toEqual({ a: undefined });
			calls == 2 && expect(result).toEqual({ a: "a" });
			calls == 3 &&
				expect(result).toEqual({ a: { b: { c: { d: "d" } } } });
			calls == 4 && expect(result).toEqual({ a: { b: "b" } });
		}
	);

	state.set({ a: "a" });
	state.set({ a: { b: { c: { d: "d" } } } });
	state.set({ a: { b: "b" } });

	expect(calls).toBe(4);
});

test("watch#chain of watches of map operation", function() {
	const state = new GState();
	let calls = 0;
	let value;
	state.watch(
		{
			a: {
				b: {
					_: {
						c: {
							d: 1
						}
					}
				}
			}
		},
		result => {
			calls++;
			calls == 1 && expect(result).toEqual({ a: undefined });
			calls == 2 && expect(result).toEqual({ a: "a" });
			calls == 3 &&
				expect(result).toEqual({
					a: { b: [{ c: { d: "d" } }, { c: { d: "d1" } }] }
				});
			calls == 4 &&
				expect(result).toEqual({
					a: { b: ["c1", { c: { d: "d1" } }] }
				});
		}
	);

	state.set({ a: "a" });
	state.set({ a: { b: { c1: { c: { d: "d" } }, c2: { c: { d: "d1" } } } } });
	state.set({ a: { b: { c1: "c1" } } });

	expect(calls).toBe(4);
});
