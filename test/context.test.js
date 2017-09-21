const GState = require("../src/index");

test("context#simple", function() {
	const state = new GState();
	const ctx = state.path(["a", "b", "c"]);
	ctx.set({
		n: "n"
	});

	expect(ctx._rootNode).toEqual({
		a: {
			b: {
				c: {
					n: "n"
				}
			}
		}
	});
});

test("context#with array key", function() {
	const state = new GState();
	const ctx = state.path(["a", 4, "c"]);
	ctx.set({
		n: "n"
	});

	expect(ctx._rootNode).toEqual({
		a: {
			4: {
				c: {
					n: "n"
				}
			}
		}
	});
});

test("context#get", function() {
	const state = new GState();

	const ctx = state.path("a.4.c");
	ctx.set({
		n: "n"
	});

	const res = ctx.get({
		n: 1
	});

	expect(res).toEqual({
		n: "n"
	});
});
