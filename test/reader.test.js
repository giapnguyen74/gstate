const GState = require("../src/index");
test("reader#simple", function(done) {
	const state = new GState();
	let counts = 0;
	state.set({
		a: {
			b: "test"
		}
	});

	state.reader("a", (node, paths) => {
		if (!node.c) {
			state.set({
				a: {
					c: "done"
				}
			});
			done();
		}
	});

	state.watch(
		{
			a: {
				b: 1,
				c: 1
			}
		},
		result => {
			counts++;
			counts == 1 &&
				expect(result).toEqual({ a: { b: "test", c: undefined } });
			counts == 2 &&
				expect(result).toEqual({ a: { b: "test", c: "done" } });
		}
	);
});

test("reader#unreader", function(done) {
	const state = new GState();
	let counts = 0;
	state.set({
		a: {
			b: "test"
		}
	});

	const reader = state.reader("a", (node, paths) => {
		expect(true).toBe(false);
		if (!node.c) {
			state.set({
				a: {
					c: "done"
				}
			});
		}
	});
	reader();

	state.watch(
		{
			a: {
				b: 1,
				c: 1
			}
		},
		result => {
			counts++;
			counts == 1 &&
				expect(result).toEqual({ a: { b: "test", c: undefined } });
		}
	);

	setTimeout(() => done());
});
