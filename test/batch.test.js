const GState = require("../src/index");
test("batch#simple", function() {
	const state = new GState();
	let counts = 0;
	const ctx = state.path(["a", "c"]);
	ctx.watch({ a: 1 }, function(res) {
		counts++;
		counts == 2 &&
			expect(res).toEqual({
				a: "d"
			});
		counts == 3 &&
			expect(res).toEqual({
				a: "e"
			});
	});
	ctx.batch(() => {
		ctx.set({ a: "a" });
		ctx.set({ a: "c" });
		ctx.set({ a: "d" });
	});

	ctx.set({ a: "e" });
	expect(counts).toBe(3);
});

test("batch#set and delete", function() {
	const state = new GState();
	let counts = 0;
	const ctx = state.path(["a", "c"]);
	ctx.watch({ a: 1 }, function(res) {
		counts++;
		counts == 2 &&
			expect(res).toEqual({
				a: undefined
			});
		counts == 3 &&
			expect(res).toEqual({
				a: "e"
			});
	});
	ctx.batch(() => {
		ctx.set({ a: "a" });
		ctx.set({ a: "c" });
		ctx.set({ a: "d" });
		ctx.delete("a");
	});

	ctx.set({ a: "e" });
	expect(counts).toBe(3);
});
